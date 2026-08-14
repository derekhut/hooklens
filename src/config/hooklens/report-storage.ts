import type { Annotation } from './types';
import { getHookPattern } from './hooks';

export type HooklensReport = {
  id: string;
  appName: string;
  imageUrl: string;
  annotations: Annotation[];
  summary: string;
  createdAt: string;
};

const STORAGE_KEY = 'hooklens.reports.v1';

export function createReportId() {
  return `rpt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildReportSummary(
  annotations: Annotation[],
  locale: string
): string {
  const isZh = locale.startsWith('zh');
  const n = annotations.length;
  const top = [...annotations].sort((a, b) => b.severity - a.severity)[0];
  const topHook = top
    ? getHookPattern(top.hookId)
    : undefined;
  const topName = topHook
    ? isZh
      ? topHook.nameZh
      : topHook.nameEn
    : isZh
      ? '未知钩子'
      : 'unknown hook';

  if (isZh) {
    return `本截图标注了 ${n} 处成瘾相关设计。最突出的是 ${topName}。这些模式利用可变奖励、无终点滚动或社交压力等机制延长使用时长，而非完成用户任务。`;
  }

  return `This screenshot marks ${n} addiction-related design${n === 1 ? '' : 's'}. The most prominent is ${topName}. These patterns use variable rewards, endless feeds, or social pressure to extend session time rather than finish the user's task.`;
}

function readAll(): Record<string, HooklensReport> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, HooklensReport>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, HooklensReport>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function saveReport(report: HooklensReport) {
  const map = readAll();
  map[report.id] = report;
  writeAll(map);
  return report;
}

export function getReport(id: string): HooklensReport | null {
  const map = readAll();
  return map[id] ?? null;
}

/** Persist blob: uploads as data URLs so the report page can reload them. */
export async function persistImageForReport(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith('blob:')) return imageUrl;

  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}
