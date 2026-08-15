import {
  getHookDimension,
  getHookPattern,
  migrateHookId,
  type HookPatternId,
} from '@/config/hooklens/hooks';
import { buildReportSummary } from '@/config/hooklens/report-storage';
import type { Annotation } from '@/config/hooklens/types';

function annotationLines(annotations: Annotation[], isZh: boolean): string {
  return annotations
    .map((ann, i) => {
      const hook = getHookPattern(ann.hookId);
      const dim = hook ? getHookDimension(hook.dimensionId) : undefined;
      const name = hook
        ? `${hook.id} · ${isZh ? hook.nameZh : hook.nameEn}`
        : ann.hookId;
      const dimName = dim ? (isZh ? dim.nameZh : dim.nameEn) : '?';
      const note = ann.note?.trim() || (isZh ? '（无备注）' : '(no note)');
      return `${i + 1}. [${dimName}] ${name} | severity ${ann.severity} | ${note}`;
    })
    .join('\n');
}

/**
 * Ask GPT to expand the template summary into a short report narrative.
 * Falls back to the template on any failure / missing key.
 */
export async function polishReportSummaryWithAi({
  annotations,
  appName,
  locale,
}: {
  annotations: Annotation[];
  appName: string;
  locale: string;
}): Promise<{ summary: string; polished: boolean }> {
  const template = buildReportSummary(annotations, locale);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || annotations.length === 0) {
    return { summary: template, polished: false };
  }

  const isZh = locale.startsWith('zh');
  const model =
    process.env.OPENAI_TEXT_MODEL?.trim() ||
    process.env.OPENAI_VISION_MODEL?.trim() ||
    'gpt-4o-mini';

  const system = isZh
    ? `你是 HookLens 成瘾设计报告写作者。根据已有标注写一段可读的报告摘要（不是列表复述）。
规则：
1) 只用中文；2–4 段，约 180–320 字
2) 说明覆盖了哪些一级维度与突出模式，解释为何延长使用时长
3) 语气冷静、科普，不要恐吓，不要医疗诊断
4) 结尾用一句话提醒：示意用途、非正式审计
5) 不要 markdown，不要标题，不要编造标注里没有的钩子`
    : `You write HookLens addiction-design report narratives from existing annotations.
Rules:
1) English only; 2–4 short paragraphs, about 120–220 words
2) Cover which core dimensions and prominent patterns appear, and why they prolong use
3) Calm, explanatory tone — no scare tactics, no medical claims
4) End with one sentence that this is illustrative / informal, not a formal audit
5) No markdown, no headings, do not invent hooks not present in the annotations`;

  const user = isZh
    ? `App：${appName || '未命名截图'}
模板摘要（可扩写，勿矛盾）：
${template}

标注明细：
${annotationLines(annotations, true)}`
    : `App: ${appName || 'Untitled screenshot'}
Template summary (expand, do not contradict):
${template}

Annotations:
${annotationLines(annotations, false)}`;

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.45,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error(
        '[hooklens/summary] openai error',
        upstream.status,
        errText.slice(0, 400)
      );
      return { summary: template, polished: false };
    }

    const payload = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content || content.length < 40) {
      return { summary: template, polished: false };
    }

    return { summary: content, polished: true };
  } catch (err) {
    console.error('[hooklens/summary] failed', err);
    return { summary: template, polished: false };
  }
}

export function normalizeIncomingAnnotations(
  raw: unknown
): Annotation[] | null {
  if (!Array.isArray(raw) || raw.length < 1 || raw.length > 40) return null;

  const out: Annotation[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    const hookRaw = migrateHookId(String(row.hookId ?? '')) ?? String(row.hookId ?? '');
    const hook = getHookPattern(hookRaw);
    if (!hook) return null;

    const rect = row.rect as Record<string, unknown> | undefined;
    if (!rect) return null;
    const x = Number(rect.x);
    const y = Number(rect.y);
    const w = Number(rect.w);
    const h = Number(rect.h);
    if (![x, y, w, h].every((n) => Number.isFinite(n))) return null;

    const severityNum = Number(row.severity);
    const severity = (
      severityNum === 1 || severityNum === 2 || severityNum === 3
        ? severityNum
        : 2
    ) as 1 | 2 | 3;

    out.push({
      id: String(row.id || `ann-${out.length}`),
      hookId: hook.id as HookPatternId,
      label: String(row.label || hook.nameEn),
      note: String(row.note || ''),
      severity,
      rect: {
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
        w: Math.min(1, Math.max(0.02, w)),
        h: Math.min(1, Math.max(0.02, h)),
      },
    });
  }

  return out;
}
