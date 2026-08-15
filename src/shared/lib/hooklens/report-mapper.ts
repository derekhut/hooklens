import { migrateHookId } from '@/config/hooklens/hooks';
import type { HooklensReport } from '@/config/hooklens/report-storage';
import type { Annotation } from '@/config/hooklens/types';
import type { HooklensReportRow } from '@/shared/models/hooklens_report';

export function rowToHooklensReport(row: HooklensReportRow): HooklensReport {
  let annotations: Annotation[] = [];
  try {
    const parsed = JSON.parse(row.annotationsJson) as Annotation[];
    if (Array.isArray(parsed)) {
      annotations = parsed.map((ann) => ({
        ...ann,
        hookId: (migrateHookId(String(ann.hookId)) ??
          ann.hookId) as Annotation['hookId'],
      }));
    }
  } catch {
    annotations = [];
  }

  return {
    id: row.id,
    appName: row.appName,
    imageUrl: row.imageUrl,
    annotations,
    summary: row.summary,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  };
}
