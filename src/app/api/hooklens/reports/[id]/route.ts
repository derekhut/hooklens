import { migrateHookId } from '@/config/hooklens/hooks';
import type { Annotation } from '@/config/hooklens/types';
import { respData, respErr } from '@/shared/lib/resp';
import { findPublicHooklensReportById } from '@/shared/models/hooklens_report';

export const runtime = 'nodejs';

function parseAnnotations(raw: string): Annotation[] {
  try {
    const parsed = JSON.parse(raw) as Annotation[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((ann) => {
      const hookId = (migrateHookId(String(ann.hookId)) ??
        ann.hookId) as Annotation['hookId'];
      return { ...ann, hookId };
    });
  } catch {
    return [];
  }
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    if (!id || id.length > 80) {
      return respErr('invalid id');
    }

    const row = await findPublicHooklensReportById(id);
    if (!row) {
      return respErr('not found');
    }

    return respData({
      id: row.id,
      appName: row.appName,
      imageUrl: row.imageUrl,
      annotations: parseAnnotations(row.annotationsJson),
      summary: row.summary,
      locale: row.locale,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
    });
  } catch (err) {
    console.error('[hooklens/reports] get failed', err);
    return respErr('failed to load report');
  }
}
