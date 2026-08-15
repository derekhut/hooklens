'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileWarning, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  formatHookOptionLabel,
  getHookDimension,
  getHookPattern,
  HOOK_DIMENSIONS,
  type DimensionId,
} from '@/config/hooklens/hooks';
import {
  getReport,
  type HooklensReport,
} from '@/config/hooklens/report-storage';
import { Link } from '@/core/i18n/navigation';
import { ScreenshotAnnotator } from '@/shared/blocks/hooklens/screenshot-annotator';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

export function ReportViewer({ reportId }: { reportId: string }) {
  const t = useTranslations('hooklens.report');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const [report, setReport] = useState<HooklensReport | null | undefined>(
    undefined
  );

  useEffect(() => {
    setReport(getReport(reportId));
  }, [reportId]);

  const grouped = useMemo(() => {
    if (!report) return [];
    const map = new Map<
      DimensionId,
      { dimId: DimensionId; items: typeof report.annotations }
    >();
    for (const ann of report.annotations) {
      const hook = getHookPattern(ann.hookId);
      const dimId = (hook?.dimensionId ?? 'A') as DimensionId;
      const bucket = map.get(dimId) ?? { dimId, items: [] };
      bucket.items.push(ann);
      map.set(dimId, bucket);
    }
    return HOOK_DIMENSIONS.map((d) => map.get(d.id)).filter(Boolean) as Array<{
      dimId: DimensionId;
      items: HooklensReport['annotations'];
    }>;
  }, [report]);

  if (report === undefined) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center gap-2">
        <Loader2 className="size-5 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-20 text-center">
        <FileWarning className="text-muted-foreground size-10" />
        <h1 className="text-2xl font-semibold">{t('not_found_title')}</h1>
        <p className="text-muted-foreground text-sm">{t('not_found_body')}</p>
        <Button asChild>
          <Link href="/analyze">{t('back_analyze')}</Link>
        </Button>
      </div>
    );
  }

  const titleApp = report.appName.trim() || t('unnamed_app');
  const created = new Date(report.createdAt).toLocaleString(
    isZh ? 'zh-CN' : 'en-US'
  );

  let findingIndex = 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-10 md:py-14">
      <header className="space-y-3">
        <p className="text-muted-foreground text-sm">{t('kicker')}</p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t('title', { app: titleApp })}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          {report.summary}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">
            {t('hook_count', { count: report.annotations.length })}
          </Badge>
          <Badge variant="outline">
            {t('dimension_count', { count: grouped.length })}
          </Badge>
          <span className="text-muted-foreground">{created}</span>
        </div>
        <p className="text-muted-foreground text-xs">{t('disclaimer')}</p>
      </header>

      <ScreenshotAnnotator
        imageUrl={report.imageUrl}
        imageAlt={titleApp}
        annotations={report.annotations}
        readOnly
      />

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">{t('findings')}</h2>
        {grouped.map((group) => {
          const dim = getHookDimension(group.dimId);
          return (
            <div key={group.dimId} className="space-y-3">
              <h3 className="text-sm font-medium">
                {group.dimId}. {dim ? (isZh ? dim.nameZh : dim.nameEn) : group.dimId}
              </h3>
              <ol className="space-y-3">
                {group.items.map((ann) => {
                  findingIndex += 1;
                  const hook = getHookPattern(ann.hookId);
                  const name = hook
                    ? formatHookOptionLabel(hook, locale)
                    : ann.label;
                  return (
                    <li
                      key={ann.id}
                      className="flex gap-3 rounded-lg border p-4 text-sm"
                    >
                      <span className="bg-amber-500 flex size-6 shrink-0 items-center justify-center rounded text-xs font-medium text-white">
                        {findingIndex}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{name}</span>
                          <Badge variant="outline">
                            {t('severity', { level: ann.severity })}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {ann.note.trim() || t('no_note')}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-3 border-t pt-6">
        <Button asChild>
          <Link href="/patterns">{t('cta_patterns')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/apps">{t('cta_apps')}</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/analyze">{t('cta_again')}</Link>
        </Button>
      </section>
    </div>
  );
}
