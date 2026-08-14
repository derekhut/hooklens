import { setRequestLocale } from 'next-intl/server';

import { AnalyzeWorkspace } from '@/shared/blocks/hooklens';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  metadataKey: 'hooklens.analyze.metadata',
  canonicalUrl: '/analyze',
});

export default async function AnalyzePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AnalyzeWorkspace />;
}
