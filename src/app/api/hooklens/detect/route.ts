import {
  HOOK_DIMENSIONS,
  HOOK_PATTERNS,
  migrateHookId,
  type HookPatternId,
} from '@/config/hooklens/hooks';
import type { AnnotationRect } from '@/config/hooklens/types';
import { respData, respErr } from '@/shared/lib/resp';

export const runtime = 'nodejs';
export const maxDuration = 60;

type DetectBody = {
  imageDataUrl?: string;
  locale?: string;
  appName?: string;
};

type RawSuggestion = {
  hookId?: string;
  note?: string;
  severity?: number;
  rect?: Partial<AnnotationRect>;
};

const HOOK_IDS = new Set(HOOK_PATTERNS.map((h) => h.id));

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function normalizeRect(
  rect: Partial<AnnotationRect> | undefined
): AnnotationRect | null {
  if (!rect) return null;
  const x = clamp01(Number(rect.x));
  const y = clamp01(Number(rect.y));
  let w = clamp01(Number(rect.w));
  let h = clamp01(Number(rect.h));
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(w) ||
    !Number.isFinite(h)
  ) {
    return null;
  }
  if (x + w > 1) w = 1 - x;
  if (y + h > 1) h = 1 - y;
  if (w < 0.02 || h < 0.02) return null;
  return { x, y, w, h };
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('invalid json');
  }
}

function buildTaxonomyForPrompt(isZh: boolean) {
  return HOOK_DIMENSIONS.map((dim) => ({
    dimensionId: dim.id,
    dimension: isZh ? dim.nameZh : dim.nameEn,
    patterns: HOOK_PATTERNS.filter((h) => h.dimensionId === dim.id).map(
      (h) => ({
        hookId: h.id,
        name: isZh ? h.nameZh : h.nameEn,
        mechanism: isZh ? h.mechanismZh : h.mechanismEn,
        lookFor: isZh ? h.detectHintZh : h.detectHintEn,
      })
    ),
  }));
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return respErr('OPENAI_API_KEY is not configured');
    }

    const body = (await req.json()) as DetectBody;
    const imageDataUrl = body.imageDataUrl?.trim();
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
      return respErr('invalid imageDataUrl');
    }

    if (imageDataUrl.length > 5_500_000) {
      return respErr('image too large');
    }

    const locale = body.locale?.startsWith('zh') ? 'zh' : 'en';
    const isZh = locale === 'zh';
    const appName =
      body.appName?.trim() || (isZh ? '未命名截图' : 'Untitled screenshot');

    const taxonomy = buildTaxonomyForPrompt(isZh);
    const allowedIds = HOOK_PATTERNS.map((h) => h.id).join(', ');

    const system = isZh
      ? `你是 HookLens 成瘾设计分类器。根据截图找出成瘾相关 UI，并严格用 taxonomy 里的 hookId（A1–E2）分类。
规则：
1) 只输出 JSON：{"annotations":[{"hookId":"A1","note":"...","severity":2,"rect":{"x":0.1,"y":0.2,"w":0.5,"h":0.15}}]}
2) hookId 必须是：${allowedIds}
3) 先判断一级维度 A–E，再选最贴切的二级模式；用 lookFor 字段对照界面证据
4) rect 为相对整图 0–1 归一化坐标（左上原点）
5) note 用一句人话说明「为什么上瘾」，引用可见 UI
6) 标 2–6 处最明显区域；不要编造看不见的元素；不要 markdown`
      : `You are HookLens, an addiction-design classifier. Find addictive UI on the screenshot and classify with taxonomy hookIds (A1–E2) only.
Rules:
1) Output JSON only: {"annotations":[{"hookId":"A1","note":"...","severity":2,"rect":{"x":0.1,"y":0.2,"w":0.5,"h":0.15}}]}
2) hookId must be one of: ${allowedIds}
3) First pick dimension A–E, then the best secondary pattern; match lookFor to visible UI evidence
4) rect is normalized 0–1 relative to the full image (origin top-left)
5) note is one plain sentence on why it is addictive, grounded in visible UI
6) Mark 2–6 clearest regions; do not invent unseen UI; no markdown`;

    const userText = isZh
      ? `App 名：${appName}\n分类体系 taxonomy：\n${JSON.stringify(taxonomy)}\n请分类并标注。severity 为 1/2/3。`
      : `App name: ${appName}\nTaxonomy:\n${JSON.stringify(taxonomy)}\nClassify and annotate. severity is 1/2/3.`;

    const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o';

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error(
        '[hooklens/detect] openai error',
        upstream.status,
        errText.slice(0, 500)
      );
      return respErr(`OpenAI request failed (${upstream.status})`);
    }

    const payload = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return respErr('empty OpenAI response');
    }

    const parsed = extractJsonObject(content) as {
      annotations?: RawSuggestion[];
    };
    const rawList = Array.isArray(parsed.annotations) ? parsed.annotations : [];

    const annotations = rawList
      .map((item) => {
        const rawId = String(item.hookId || '');
        const hookId = migrateHookId(rawId);
        if (!hookId || !HOOK_IDS.has(hookId)) return null;
        const rect = normalizeRect(item.rect);
        if (!rect) return null;
        const severityNum = Number(item.severity);
        const severity = (
          severityNum === 1 || severityNum === 3 ? severityNum : 2
        ) as 1 | 2 | 3;
        const hook = HOOK_PATTERNS.find((h) => h.id === hookId)!;
        const note = String(item.note || '').trim();
        return {
          hookId: hookId as HookPatternId,
          label: isZh ? hook.nameZh : hook.nameEn,
          note: note || (isZh ? hook.blurbZh : hook.blurbEn),
          severity,
          rect,
        };
      })
      .filter(Boolean);

    if (annotations.length < 1) {
      return respErr('no valid annotations from model');
    }

    return respData({ annotations });
  } catch (e) {
    console.error('[hooklens/detect]', e);
    return respErr(e instanceof Error ? e.message : 'detect failed');
  }
}
