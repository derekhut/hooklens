import { setRequestLocale } from 'next-intl/server';

import { LooplyDemoWorkspace } from '@/shared/blocks/hooklens';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  metadataKey: 'hooklens.demo.metadata',
  canonicalUrl: '/demo',
});

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LooplyDemoWorkspace />;
}
