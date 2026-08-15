import type { Annotation } from './types';
import {
  getHookDimension,
  getHookPattern,
  migrateHookId,
} from './hooks';

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

function migrateAnnotations(annotations: Annotation[]): Annotation[] {
  return annotations.map((ann) => {
    const hookId = migrateHookId(ann.hookId) ?? ann.hookId;
    const hook = getHookPattern(String(hookId));
    return {
      ...ann,
      hookId: hookId as Annotation['hookId'],
      label: hook ? ann.label || hook.nameEn : ann.label,
    };
  });
}

export function buildReportSummary(
  annotations: Annotation[],
  locale: string
): string {
  const isZh = locale.startsWith('zh');
  const migrated = migrateAnnotations(annotations);
  const n = migrated.length;
  const dimIds = new Set(
    migrated
      .map((a) => getHookPattern(a.hookId)?.dimensionId)
      .filter(Boolean)
  );
  const top = [...migrated].sort((a, b) => b.severity - a.severity)[0];
  const topHook = top ? getHookPattern(top.hookId) : undefined;
  const topName = topHook
    ? `${topHook.id} · ${isZh ? topHook.nameZh : topHook.nameEn}`
    : isZh
      ? '未知模式'
      : 'unknown pattern';
  const dimNames = [...dimIds]
    .map((id) => {
      const d = getHookDimension(id!);
      return d ? (isZh ? d.nameZh : d.nameEn) : id;
    })
    .join(isZh ? '、' : ', ');

  if (isZh) {
    return `本截图标注了 ${n} 处成瘾相关设计，覆盖 ${dimIds.size} 个一级维度（${dimNames || '—'}）。最突出的是 ${topName}。分类参考边界消除、可变酬赏、社交捆绑、沉没成本与注意力劫持等研究框架（示意用途）。`;
  }

  return `This screenshot marks ${n} addiction-related design${n === 1 ? '' : 's'} across ${dimIds.size} core dimension${dimIds.size === 1 ? '' : 's'} (${dimNames || '—'}). The most prominent is ${topName}. Taxonomy informed by boundary-elimination, variable-reward, social-trap, sunk-cost, and attention-hijack research (illustrative).`;
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
  map[report.id] = {
    ...report,
    annotations: migrateAnnotations(report.annotations),
  };
  writeAll(map);
  return map[report.id];
}

export function getReport(id: string): HooklensReport | null {
  const map = readAll();
  const report = map[id];
  if (!report) return null;
  return {
    ...report,
    annotations: migrateAnnotations(report.annotations),
  };
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
