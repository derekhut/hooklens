import { setRequestLocale } from 'next-intl/server';

import { ReportViewer } from '@/shared/blocks/hooklens/report-viewer';
import { rowToHooklensReport } from '@/shared/lib/hooklens/report-mapper';
import { getMetadata } from '@/shared/lib/seo';
import { findPublicHooklensReportById } from '@/shared/models/hooklens_report';

export const generateMetadata = getMetadata({
  title: 'Addiction Report — HookLens',
  description: 'Annotated screenshot addiction report from HookLens.',
  canonicalUrl: '/report',
});

export default async function ReportPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  let initialReport = null;
  try {
    const row = await findPublicHooklensReportById(id);
    if (row) initialReport = rowToHooklensReport(row);
  } catch (err) {
    console.error('[report page] db load failed', err);
  }

  return <ReportViewer reportId={id} initialReport={initialReport} />;
}
