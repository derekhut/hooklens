'use client';

import { useEffect, useMemo, useState } from 'react';
import { Copy, FileWarning, Loader2, Printer } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  formatHookOptionLabel,
  getHookDimension,
  getHookPattern,
  HOOK_DIMENSIONS,
  type DimensionId,
} from '@/config/hooklens/hooks';
import {
  getReport,
  saveReport,
  type HooklensReport,
} from '@/config/hooklens/report-storage';
import { Link } from '@/core/i18n/navigation';
import { ScreenshotAnnotator } from '@/shared/blocks/hooklens/screenshot-annotator';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

function severityTone(level: 1 | 2 | 3) {
  if (level === 3) return 'border-rose-300 text-rose-600';
  if (level === 2) return 'border-amber-300 text-amber-700';
  return 'border-slate-300 text-slate-600';
}

export function ReportViewer({
  reportId,
  initialReport = null,
}: {
  reportId: string;
  initialReport?: HooklensReport | null;
}) {
  const t = useTranslations('hooklens.report');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const [report, setReport] = useState<HooklensReport | null | undefined>(
    initialReport ?? undefined
  );

  useEffect(() => {
    if (initialReport) {
      setReport(initialReport);
      saveReport(initialReport);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/hooklens/reports/${reportId}`);
        const json = (await res.json()) as {
          code: number;
          data?: HooklensReport;
        };
        if (!cancelled && json.code === 0 && json.data) {
          setReport(json.data);
          saveReport(json.data);
          return;
        }
      } catch {
        // fall through to local cache
      }

      if (!cancelled) {
        setReport(getReport(reportId));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reportId, initialReport]);

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
      <div className="flex min-h-[40vh] items-center justify-center gap-2 bg-[#F4F6FA] text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 bg-[#F4F6FA] px-6 py-20 text-center">
        <FileWarning className="size-10 text-slate-400" />
        <h1 className="text-2xl font-semibold text-slate-900">
          {t('not_found_title')}
        </h1>
        <p className="text-sm text-slate-500">{t('not_found_body')}</p>
        <Button asChild className="rounded-xl bg-[#2F6BFF] text-white hover:bg-[#2458d9]">
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('copied'));
    } catch {
      toast.error(t('copy_failed'));
    }
  };

  const stats = [
    { label: t('stat_app'), value: titleApp },
    { label: t('stat_hooks'), value: String(report.annotations.length) },
    { label: t('stat_dims'), value: String(grouped.length) },
    { label: t('stat_time'), value: created },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FA]">
      <style>{`
        @media print {
          header, footer, nav { display: none !important; }
          .print-hide { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
        <header className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-[#2F6BFF] uppercase">
            {t('kicker')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {t('title', { app: titleApp })}
          </h1>
          <p className="max-w-2xl whitespace-pre-wrap text-base text-slate-600">
            {report.summary}
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400">{t('disclaimer')}</p>

        <ScreenshotAnnotator
          imageUrl={report.imageUrl}
          imageAlt={titleApp}
          annotations={report.annotations}
          readOnly
        />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('findings')}</h2>
          {grouped.map((group) => {
            const dim = getHookDimension(group.dimId);
            return (
              <div key={group.dimId} className="space-y-2">
                <h3 className="text-sm font-medium text-slate-700">
                  {group.dimId}.{' '}
                  {dim ? (isZh ? dim.nameZh : dim.nameEn) : group.dimId}
                </h3>
                <ol className="space-y-2">
                  {group.items.map((ann) => {
                    findingIndex += 1;
                    const hook = getHookPattern(ann.hookId);
                    const name = hook
                      ? formatHookOptionLabel(hook, locale)
                      : ann.label;
                    return (
                      <li
                        key={ann.id}
                        className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm"
                      >
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white">
                          {findingIndex}
                        </span>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {name}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px]',
                                severityTone(ann.severity)
                              )}
                            >
                              {t('severity', { level: ann.severity })}
                            </Badge>
                          </div>
                          <p className="text-slate-500">
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

        <section className="print-hide flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <Button
            type="button"
            className="rounded-xl bg-[#2F6BFF] text-white hover:bg-[#2458d9]"
            onClick={copyLink}
          >
            <Copy className="size-4" />
            {t('copy_link')}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200 bg-white"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            {t('print_report')}
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-slate-200 bg-white">
            <Link href="/patterns">{t('cta_patterns')}</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/analyze">{t('cta_again')}</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
