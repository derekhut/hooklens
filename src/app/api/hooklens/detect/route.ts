import { HOOK_PATTERNS, type HookPatternId } from '@/config/hooklens/hooks';
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

function normalizeRect(rect: Partial<AnnotationRect> | undefined): AnnotationRect | null {
  if (!rect) return null;
  const x = clamp01(Number(rect.x));
  const y = clamp01(Number(rect.y));
  let w = clamp01(Number(rect.w));
  let h = clamp01(Number(rect.h));
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
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

    // Rough size guard (~4MB base64 payload)
    if (imageDataUrl.length > 5_500_000) {
      return respErr('image too large');
    }

    const locale = body.locale?.startsWith('zh') ? 'zh' : 'en';
    const isZh = locale === 'zh';
    const appName = body.appName?.trim() || (isZh ? '未命名截图' : 'Untitled screenshot');

    const dictionary = HOOK_PATTERNS.map((h) => ({
      id: h.id,
      name: isZh ? h.nameZh : h.nameEn,
      blurb: isZh ? h.blurbZh : h.blurbEn,
    }));

    const system = isZh
      ? `你是 HookLens 助手。根据 App 截图找出容易让人上瘾的 UI 区域。只使用给定 hookId。rect 为相对整图的 0–1 归一化坐标 {x,y,w,h}（左上为原点）。返回严格 JSON：{"annotations":[{"hookId":"infinite","note":"...","severity":2,"rect":{"x":0.1,"y":0.2,"w":0.5,"h":0.2}}]}。不要 markdown。`
      : `You are HookLens. Find addictive UI regions on an app screenshot. Use only the given hookIds. rect is normalized 0–1 relative to the full image {x,y,w,h} (origin top-left). Return strict JSON: {"annotations":[{"hookId":"infinite","note":"...","severity":2,"rect":{"x":0.1,"y":0.2,"w":0.5,"h":0.2}}]}. No markdown.`;

    const userText = isZh
      ? `App 名：${appName}\n可用钩子：${JSON.stringify(dictionary)}\n请标出 2–5 处最明显的成瘾设计。severity 为 1/2/3。`
      : `App name: ${appName}\nAllowed hooks: ${JSON.stringify(dictionary)}\nMark 2–5 of the most obvious addictive designs. severity is 1/2/3.`;

    const model = process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o';

    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
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
      console.error('[hooklens/detect] openai error', upstream.status, errText.slice(0, 500));
      return respErr(`OpenAI request failed (${upstream.status})`);
    }

    const payload = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return respErr('empty OpenAI response');
    }

    const parsed = extractJsonObject(content) as { annotations?: RawSuggestion[] };
    const rawList = Array.isArray(parsed.annotations) ? parsed.annotations : [];

    const annotations = rawList
      .map((item) => {
        const hookId = String(item.hookId || '') as HookPatternId;
        if (!HOOK_IDS.has(hookId)) return null;
        const rect = normalizeRect(item.rect);
        if (!rect) return null;
        const severityNum = Number(item.severity);
        const severity = (severityNum === 1 || severityNum === 3 ? severityNum : 2) as
          | 1
          | 2
          | 3;
        const hook = HOOK_PATTERNS.find((h) => h.id === hookId)!;
        const note = String(item.note || '').trim();
        return {
          hookId,
          label: isZh ? hook.nameZh : hook.nameEn,
          note:
            note ||
            (isZh ? hook.blurbZh : hook.blurbEn),
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
