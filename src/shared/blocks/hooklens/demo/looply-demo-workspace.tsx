'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import {
  Bookmark,
  Compass,
  Clock,
  Flame,
  Home,
  Loader2,
  Moon,
  Pause,
  Play,
  Search,
  Settings,
  VolumeX,
  Bell,
  ScanSearch,
  BookOpenText,
  Box,
  TrendingUp,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  DEMO_ARTICLES,
  DEMO_HOTSPOTS,
  DEMO_NAV,
  DEMO_READ_LATER,
  DEMO_STRONG_HOOKS,
  DEMO_TRENDING,
  DEMO_VIDEO,
  type DemoBadgeTone,
  type DemoHotspotId,
} from '@/config/hooklens/demo-feed';
import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const NAV_ICONS = {
  home: Home,
  compass: Compass,
  bookmark: Bookmark,
  clock: Clock,
  settings: Settings,
} as const;

const TONE_BG: Record<DemoBadgeTone, string> = {
  orange: 'bg-orange-500',
  purple: 'bg-violet-500',
  blue: 'bg-[#2F6BFF]',
};

type Phase = 'idle' | 'scanning' | 'report';

function Marker({
  n,
  tone,
  label,
  active,
  onClick,
  className,
}: {
  n: number;
  tone: DemoBadgeTone;
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'absolute z-20 flex items-center gap-1.5 drop-shadow-md transition',
        active && 'scale-105',
        className
      )}
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white',
          TONE_BG[tone]
        )}
      >
        {n}
      </span>
      <span
        className={cn(
          'max-w-[11rem] truncate rounded-md px-2 py-0.5 text-left text-[11px] font-medium text-white',
          TONE_BG[tone]
        )}
      >
        {label}
      </span>
    </button>
  );
}

export function LooplyDemoWorkspace() {
  const t = useTranslations('hooklens.demo');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');

  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedId, setSelectedId] = useState<DemoHotspotId | null>(null);
  const [seconds, setSeconds] = useState(5);
  const [playing, setPlaying] = useState(true);

  const showMarks = phase === 'report';

  useEffect(() => {
    if (phase !== 'idle' || !playing) return;
    setSeconds(5);
    const id = window.setInterval(() => {
      setSeconds((s) => (s <= 1 ? 5 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, playing]);

  const startScan = () => {
    setPhase('scanning');
    setSelectedId(null);
    window.setTimeout(() => {
      setPhase('report');
      setSelectedId('hero');
    }, 1100);
  };

  const reset = () => {
    setPhase('idle');
    setSelectedId(null);
    setPlaying(true);
  };

  const select = (id: DemoHotspotId) => {
    if (phase !== 'report') {
      setPhase('scanning');
      window.setTimeout(() => {
        setPhase('report');
        setSelectedId(id);
      }, 1100);
      return;
    }
    setSelectedId(id);
  };

  const labelOf = (id: DemoHotspotId) => {
    const h = DEMO_HOTSPOTS.find((x) => x.id === id);
    if (!h) return '';
    return isZh ? h.titleZh : h.titleEn;
  };

  const marker = (id: DemoHotspotId, className: string) => {
    const h = DEMO_HOTSPOTS.find((x) => x.id === id);
    if (!h || !showMarks) return null;
    return (
      <Marker
        n={h.n}
        tone={h.tone}
        label={labelOf(id)}
        active={selectedId === id}
        onClick={() => select(id)}
        className={className}
      />
    );
  };

  return (
    <div
      className="looply-demo min-h-screen w-full bg-[#F7F8FA] text-slate-900"
      style={{ '--looply-blue': '#2F6BFF' } as CSSProperties}
    >
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-6">
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[#2F6BFF]">
              ∞
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {t('brand')}
            </span>
            <span className="hidden text-slate-300 sm:inline">|</span>
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              HookLens
            </span>
          </div>

          <div className="mx-4 hidden min-w-0 flex-1 items-center gap-4 lg:flex">
            <div className="flex h-9 max-w-xs flex-1 items-center gap-2 rounded-full bg-[#F0F2F5] px-3 text-sm text-slate-500">
              <Search className="size-4 shrink-0" />
              <span className="truncate">{t('search_placeholder')}</span>
            </div>
            <nav className="flex items-center gap-4 text-sm text-slate-600">
              <Link href="/analyze" className="flex items-center gap-1 hover:text-[#2F6BFF]">
                <ScanSearch className="size-3.5" />
                {t('nav_analyze')}
              </Link>
              <Link href="/patterns" className="flex items-center gap-1 hover:text-[#2F6BFF]">
                <BookOpenText className="size-3.5" />
                {t('nav_patterns')}
              </Link>
              <Link href="/apps" className="flex items-center gap-1 hover:text-[#2F6BFF]">
                <Box className="size-3.5" />
                {t('nav_apps')}
              </Link>
              <span className="font-medium text-[#2F6BFF]">{t('nav_demo')}</span>
            </nav>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              className="rounded-full bg-[#2F6BFF] hover:bg-[#2558d6]"
              onClick={phase === 'report' ? reset : startScan}
              disabled={phase === 'scanning'}
            >
              {phase === 'scanning' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              {phase === 'report' ? t('rescan') : t('scan_cta')}
            </Button>
            <Moon className="hidden size-4 text-slate-500 md:block" />
            <div className="relative">
              <button
                type="button"
                className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
                onClick={() => select('notify')}
              >
                <Bell className="size-5" />
                <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  2+
                </span>
              </button>
              {marker('notify', 'top-9 right-0')}
            </div>
            <div
              className="size-8 overflow-hidden rounded-full bg-slate-200 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&q=80)',
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'mx-auto grid max-w-[1600px] grid-cols-1 lg:grid-cols-[184px_minmax(0,1fr)]',
          showMarks && 'xl:grid-cols-[184px_minmax(0,1fr)_300px]'
        )}
      >
        <aside className="hidden border-r border-slate-200/80 bg-white py-4 lg:block">
          <nav className="flex flex-col gap-1 px-3">
            {DEMO_NAV.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = item.id === 'home';
              return (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm',
                    active
                      ? 'bg-[#EEF3FF] font-medium text-[#2F6BFF]'
                      : 'text-slate-600'
                  )}
                >
                  <Icon className="size-4" />
                  {isZh ? item.labelZh : item.labelEn}
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="relative min-w-0 px-4 py-4 md:px-6 md:py-5">
          {phase === 'scanning' && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
              <Loader2 className="size-8 animate-spin text-[#2F6BFF]" />
              <p className="text-sm font-medium text-slate-700">
                {t('scanning')}
              </p>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                {marker('hero', 'top-3 left-3')}
                {marker('autoplay', 'right-3 bottom-14')}
                <div
                  className="aspect-[16/9] w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${DEMO_VIDEO.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
                  <VolumeX className="size-3.5" />
                  {t('muted')}
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 left-3 rounded-full bg-black/50 p-2 text-white"
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
                <div className="absolute right-3 bottom-3 max-w-[220px] rounded-xl bg-black/65 px-3 py-2 text-xs text-white backdrop-blur-sm">
                  <p>{t('autoplay_banner', { seconds })}</p>
                  <span className="mt-1 inline-block text-[#9DB7FF]">
                    {t('cancel_autoplay')}
                  </span>
                </div>
              </div>

              <div className="relative mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {marker('cards', '-top-2 left-2')}
                {DEMO_ARTICLES.map((a, i) => (
                  <article
                    key={a.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
                  >
                    {i === 0 && marker('bookmark', 'top-2 right-2')}
                    <div
                      className="aspect-[16/10] bg-cover bg-center"
                      style={{ backgroundImage: `url(${a.image})` }}
                    />
                    <div className="space-y-2 p-3.5">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                        {isZh ? a.titleZh : a.titleEn}
                      </h3>
                      <p className="line-clamp-2 text-xs text-slate-500">
                        {isZh ? a.excerptZh : a.excerptEn}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                        <span className="size-5 rounded-full bg-slate-200" />
                        <span className="truncate">
                          {isZh ? a.authorZh : a.authorEn}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{t('min_read', { minutes: a.minutes })}</span>
                        <Bookmark className="ml-auto size-3.5 shrink-0" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="relative mt-6 flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-4">
                {marker('infinite', '-top-3 left-4')}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="size-4 animate-spin" />
                  {t('loading_more')}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
                {marker('streak', '-top-2 -left-2')}
                <div className="flex items-center gap-2">
                  <Flame className="size-5 text-orange-500" />
                  <h3 className="text-sm font-semibold">
                    {t('streak_title', { days: 7 })}
                  </h3>
                </div>
                <p className="mt-2 text-xs text-slate-500">{t('streak_body')}</p>
              </div>

              <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
                {marker('trending', '-top-2 -left-2')}
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="size-4 text-[#2F6BFF]" />
                  <h3 className="text-sm font-semibold">{t('trending')}</h3>
                </div>
                <ol className="space-y-2.5">
                  {DEMO_TRENDING.map((item, i) => (
                    <li
                      key={item.en}
                      className="flex gap-2 text-sm text-slate-700"
                    >
                      <span className="w-4 font-semibold text-[#2F6BFF]">
                        {i + 1}
                      </span>
                      {isZh ? item.zh : item.en}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="relative rounded-2xl border border-slate-200 bg-white p-4">
                {marker('readlater', '-top-2 -left-2')}
                <div className="mb-3 flex items-center gap-2">
                  <Bookmark className="size-4 text-[#2F6BFF]" />
                  <h3 className="text-sm font-semibold">{t('read_later')}</h3>
                </div>
                <div className="flex gap-3">
                  <div
                    className="size-14 shrink-0 rounded-lg bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${DEMO_READ_LATER.image})`,
                    }}
                  />
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">
                      {isZh ? DEMO_READ_LATER.titleZh : DEMO_READ_LATER.titleEn}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('min_read', { minutes: DEMO_READ_LATER.minutes })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside
          className={cn(
            'border-l border-slate-200/80 bg-[#F4F6FA] p-4',
            showMarks ? 'hidden xl:block' : 'hidden'
          )}
        >
          <div className="flex h-full flex-col gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {t('report_title')}
              </h2>
              <p className="mt-1 text-xs text-slate-500">{t('report_sub')}</p>
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
              {DEMO_HOTSPOTS.map((h) => {
                const active = selectedId === h.id;
                return (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => select(h.id)}
                      className={cn(
                        'flex w-full gap-2.5 rounded-xl px-2 py-2 text-left transition',
                        active ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-white/70'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white',
                          TONE_BG[h.tone]
                        )}
                      >
                        {h.n}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900">
                          {isZh ? h.titleZh : h.titleEn}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                          {isZh ? h.blurbZh : h.blurbEn}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">
                {t('strongest')}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {DEMO_STRONG_HOOKS.join(' · ')}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {t('mechanism')}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
