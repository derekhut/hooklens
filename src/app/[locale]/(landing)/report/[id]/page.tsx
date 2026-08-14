import { setRequestLocale } from 'next-intl/server';

import { ReportViewer } from '@/shared/blocks/hooklens/report-viewer';
import { getMetadata } from '@/shared/lib/seo';

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

  return <ReportViewer reportId={id} />;
}
