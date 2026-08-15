import { createReportId } from '@/config/hooklens/report-storage';
import {
  normalizeIncomingAnnotations,
  polishReportSummaryWithAi,
} from '@/shared/lib/hooklens/report-summary';
import { respData, respErr } from '@/shared/lib/resp';
import { createHooklensReport } from '@/shared/models/hooklens_report';

export const runtime = 'nodejs';
export const maxDuration = 60;

type CreateBody = {
  appName?: string;
  imageUrl?: string;
  annotations?: unknown;
  locale?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;
    const imageUrl = body.imageUrl?.trim();
    if (!imageUrl) {
      return respErr('imageUrl required');
    }
    if (
      !imageUrl.startsWith('data:image/') &&
      !imageUrl.startsWith('https://') &&
      !imageUrl.startsWith('http://')
    ) {
      return respErr('invalid imageUrl');
    }
    if (imageUrl.length > 5_500_000) {
      return respErr('image too large');
    }

    const annotations = normalizeIncomingAnnotations(body.annotations);
    if (!annotations) {
      return respErr('invalid annotations');
    }

    const locale = body.locale?.startsWith('zh') ? 'zh' : 'en';
    const appName = body.appName?.trim() || '';
    const id = createReportId();

    const { summary, polished } = await polishReportSummaryWithAi({
      annotations,
      appName,
      locale,
    });

    const row = await createHooklensReport({
      id,
      appName,
      imageUrl,
      annotationsJson: JSON.stringify(annotations),
      summary,
      locale,
      isPublic: true,
    });

    return respData({
      id: row.id,
      appName: row.appName,
      imageUrl: row.imageUrl,
      annotations,
      summary: row.summary,
      locale: row.locale,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
      polished,
    });
  } catch (err) {
    console.error('[hooklens/reports] create failed', err);
    return respErr('failed to create report');
  }
}
