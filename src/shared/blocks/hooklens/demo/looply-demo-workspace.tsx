'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import {
  Bookmark,
  Compass,
  Clock,
  Flame,
  Home,
  Loader2,
  Pause,
  Play,
  Search,
  Settings,
  VolumeX,
  Bell,
  Check,
  TrendingUp,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  DEMO_ARTICLES,
  DEMO_HOTSPOTS,
  DEMO_NAV,
  DEMO_READ_LATER,
  DEMO_REDUCTIONS,
  DEMO_TRENDING,
  DEMO_VIDEO,
  type DemoHotspotId,
  type DemoMode,
} from '@/config/hooklens/demo-feed';
import {
  formatHookOptionLabel,
  getHookPattern,
} from '@/config/hooklens/hooks';
import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { cn } from '@/shared/lib/utils';

const NAV_ICONS = {
  home: Home,
  compass: Compass,
  bookmark: Bookmark,
  clock: Clock,
  settings: Settings,
} as const;

function AuditPanelBody({
  selectedId,
  onSelect,
  onEnterCalm,
  onBack,
}: {
  selectedId: DemoHotspotId;
  onSelect: (id: DemoHotspotId) => void;
  onEnterCalm: () => void;
  onBack: () => void;
}) {
  const t = useTranslations('hooklens.demo');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const selected =
    DEMO_HOTSPOTS.find((h) => h.id === selectedId) ?? DEMO_HOTSPOTS[0];
  const hook = getHookPattern(selected.hookId);

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-xs font-medium tracking-wide text-[#2F6BFF] uppercase">
          {t('audit_title')}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {t('audit_found', { count: DEMO_HOTSPOTS.length })}
        </h2>
      </div>

      <ul className="space-y-2">
        {DEMO_HOTSPOTS.map((h, i) => {
          const active = h.id === selectedId;
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => onSelect(h.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                  active
                    ? 'border-[#2F6BFF] bg-[#EEF3FF]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-800">
                  {isZh ? h.titleZh : h.titleEn}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 text-[10px]',
                    h.severity === 'high'
                      ? 'border-rose-300 text-rose-600'
                      : 'border-amber-300 text-amber-700'
                  )}
                >
                  {h.severity === 'high'
                    ? t('severity_high')
                    : t('severity_medium')}
                </Badge>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex-1 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            {t('recognition')}
          </p>
          <p className="mt-1 font-medium text-slate-900">
            {hook ? formatHookOptionLabel(hook, locale) : selected.hookId}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            {t('evidence')}
          </p>
          <p className="mt-1 text-slate-700">
            {isZh ? selected.evidenceZh : selected.evidenceEn}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            {t('impact')}
          </p>
          <p className="mt-1 text-slate-700">
            {isZh ? selected.impactZh : selected.impactEn}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            {t('suggestion')}
          </p>
          <p className="mt-1 text-slate-700">
            {isZh ? selected.suggestionZh : selected.suggestionEn}
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <Button
          className="w-full bg-[#2F6BFF] hover:bg-[#2558d6]"
          onClick={onEnterCalm}
        >
          {t('enter_calm')}
        </Button>
        <button
          type="button"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground w-full text-center text-sm"
        >
          {t('back_standard')}
        </button>
      </div>
    </div>
  );
}

export function LooplyDemoWorkspace() {
  const t = useTranslations('hooklens.demo');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');

  const [mode, setMode] = useState<DemoMode>('standard');
  const [selectedId, setSelectedId] = useState<DemoHotspotId>('autoplay');
  const [seconds, setSeconds] = useState(5);
  const [autoplayOn, setAutoplayOn] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [mobileAuditOpen, setMobileAuditOpen] = useState(false);

  const isAudit = mode === 'audit';
  const isCalm = mode === 'calm';
  const showHotspots = isAudit;

  useEffect(() => {
    if (mode !== 'standard' || !autoplayOn || !playing) return;
    setSeconds(5);
    const id = window.setInterval(() => {
      setSeconds((s) => (s <= 1 ? 5 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [mode, autoplayOn, playing]);

  const startAudit = () => {
    setMode('audit');
    setSelectedId('autoplay');
    setMobileAuditOpen(true);
  };

  const enterCalm = () => {
    setMode('calm');
    setAutoplayOn(false);
    setPlaying(false);
    setMobileAuditOpen(false);
  };

  const backStandard = () => {
    setMode('standard');
    setAutoplayOn(true);
    setPlaying(true);
    setMobileAuditOpen(false);
  };

  const selectHotspot = (id: DemoHotspotId) => {
    setSelectedId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileAuditOpen(true);
    }
  };

  const ringFor = (id: DemoHotspotId) =>
    DEMO_HOTSPOTS.findIndex((h) => h.id === id) + 1;

  return (
    <div
      className="looply-demo -mx-0 min-h-[calc(100vh-4rem)] w-full bg-[#F7F8FA] text-slate-900"
      style={
        {
          '--looply-blue': '#2F6BFF',
        } as CSSProperties
      }
    >
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-4 px-4 md:px-6">
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-[var(--looply-blue)] text-xl font-bold tracking-tight">
              ∞
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {t('brand')}
            </span>
          </div>

          <div className="mx-auto hidden max-w-xl flex-1 md:block">
            <div className="flex h-10 items-center gap-2 rounded-full bg-[#F0F2F5] px-4 text-sm text-slate-500">
              <Search className="size-4 shrink-0" />
              <span className="truncate">{t('search_placeholder')}</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <p className="text-muted-foreground hidden text-xs lg:block">
              {t('demo_kicker')}
            </p>
            <button
              type="button"
              className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="size-5" />
              {!isCalm && (
                <span className="absolute top-1 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {isCalm ? '' : '9+'}
                </span>
              )}
              {isCalm && (
                <span className="absolute top-1.5 right-1 size-2 rounded-full bg-[#2F6BFF]" />
              )}
            </button>
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

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-0 lg:grid-cols-[200px_minmax(0,1fr)_300px]">
        {/* Left nav */}
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

        {/* Main */}
        <main
          className={cn(
            'relative min-w-0 px-4 py-4 md:px-6 md:py-5',
            isAudit && 'after:pointer-events-none after:absolute after:inset-0 after:bg-[#2F6BFF]/[0.04]'
          )}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {(isCalm || isAudit) && (
                <>
                  <Button
                    size="sm"
                    variant={!isCalm ? 'default' : 'outline'}
                    className={cn(
                      !isCalm && 'bg-[#2F6BFF] hover:bg-[#2558d6]'
                    )}
                    onClick={backStandard}
                  >
                    {t('mode_standard')}
                  </Button>
                  <Button
                    size="sm"
                    variant={isCalm ? 'default' : 'outline'}
                    className={cn(isCalm && 'bg-[#2F6BFF] hover:bg-[#2558d6]')}
                    onClick={enterCalm}
                  >
                    {t('mode_calm')}
                  </Button>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="bg-[#2F6BFF] hover:bg-[#2558d6]"
                onClick={startAudit}
              >
                {t('scan_cta')}
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/analyze">{t('analyze_link')}</Link>
              </Button>
            </div>
          </div>

          {isAudit && (
            <div
              className={cn(
                'relative mb-4 rounded-2xl border border-slate-200 bg-white p-4',
                selectedId === 'streak' && 'ring-2 ring-[#2F6BFF]'
              )}
            >
              <button
                type="button"
                onClick={() => selectHotspot('streak')}
                className={cn(
                  'absolute -top-2 -left-2 z-10 flex size-7 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white shadow',
                  selectedId === 'streak' && 'scale-110'
                )}
              >
                {ringFor('streak')}
              </button>
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-orange-500" />
                <h3 className="text-sm font-semibold">
                  {t('streak_title', { days: 7 })}
                </h3>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {t('streak_body')}
              </p>
            </div>
          )}

          {/* Video */}
          <div
            className={cn(
              'relative overflow-hidden rounded-2xl bg-slate-900',
              showHotspots &&
                selectedId === 'autoplay' &&
                'ring-2 ring-[#2F6BFF] ring-offset-2'
            )}
          >
            <div
              className="aspect-[16/9] w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${DEMO_VIDEO.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
              <VolumeX className="size-3.5" />
              {isCalm || !playing ? t('paused') : t('muted')}
            </div>
            <button
              type="button"
              className="absolute bottom-3 left-3 rounded-full bg-black/50 p-2 text-white"
              onClick={() => setPlaying((p) => !p)}
            >
              {playing && !isCalm ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
            </button>
            {!isCalm && autoplayOn && (
              <div
                className={cn(
                  'absolute right-3 bottom-3 max-w-[220px] rounded-xl bg-black/65 px-3 py-2 text-xs text-white backdrop-blur-sm',
                  showHotspots &&
                    selectedId === 'autoplay' &&
                    'ring-2 ring-[#2F6BFF]'
                )}
              >
                <p>{t('autoplay_banner', { seconds })}</p>
                <button
                  type="button"
                  className="mt-1 text-[#9DB7FF] underline-offset-2 hover:underline"
                  onClick={() => setAutoplayOn(false)}
                >
                  {t('cancel_autoplay')}
                </button>
              </div>
            )}
            {showHotspots && (
              <button
                type="button"
                className="absolute top-3 right-3 z-30 flex size-7 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white shadow"
                onClick={() => selectHotspot('autoplay')}
              >
                {ringFor('autoplay')}
              </button>
            )}
          </div>

          {/* Articles */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {DEMO_ARTICLES.map((a) => (
              <article
                key={a.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
              >
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{ backgroundImage: `url(${a.image})` }}
                />
                <div className="space-y-2 p-3.5">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                    {isZh ? a.titleZh : a.titleEn}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
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

          {/* Footer load */}
          <div
            className={cn(
              'relative mt-6 flex items-center justify-center rounded-xl border border-dashed border-slate-200 py-4',
              showHotspots &&
                selectedId === 'infinite' &&
                'border-[#2F6BFF] bg-[#EEF3FF]',
              showHotspots && 'ring-offset-2'
            )}
          >
            {showHotspots && (
              <span className="absolute -top-3 left-4 z-10">
                <button
                  type="button"
                  onClick={() => selectHotspot('infinite')}
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white shadow',
                    selectedId === 'infinite' && 'scale-110'
                  )}
                >
                  {ringFor('infinite')}
                </button>
              </span>
            )}
            {isCalm ? (
              <Button variant="outline" className="min-w-[160px] rounded-xl">
                {t('load_more')}
              </Button>
            ) : (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {t('loading_more')}
              </div>
            )}
          </div>
        </main>

        {/* Right column */}
        <aside className="hidden border-l border-slate-200/80 bg-[#F7F8FA] p-4 lg:block">
          {isAudit ? (
            <AuditPanelBody
              selectedId={selectedId}
              onSelect={setSelectedId}
              onEnterCalm={enterCalm}
              onBack={backStandard}
            />
          ) : (
            <div className="space-y-4">
              {isCalm ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold">
                    {t('reduced_title', { count: DEMO_REDUCTIONS.length })}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {DEMO_REDUCTIONS.map((r) => (
                      <li
                        key={r.en}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-[#2F6BFF]" />
                        {isZh ? r.zh : r.en}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  className={cn(
                    'relative rounded-2xl border border-slate-200 bg-white p-4',
                    showHotspots &&
                      selectedId === 'streak' &&
                      'ring-2 ring-[#2F6BFF]'
                  )}
                >
                  {showHotspots && (
                    <button
                      type="button"
                      onClick={() => selectHotspot('streak')}
                      className="absolute -top-2 -left-2 z-10 flex size-7 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white shadow"
                    >
                      {ringFor('streak')}
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <Flame className="size-5 text-orange-500" />
                    <h3 className="text-sm font-semibold">
                      {t('streak_title', { days: 7 })}
                    </h3>
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {t('streak_body')}
                  </p>
                </div>
              )}

              <div
                className={cn(
                  'rounded-2xl border border-slate-200 bg-white p-4',
                  isCalm && 'opacity-70'
                )}
              >
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
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
                      {isZh
                        ? DEMO_READ_LATER.titleZh
                        : DEMO_READ_LATER.titleEn}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {isZh
                        ? DEMO_READ_LATER.excerptZh
                        : DEMO_READ_LATER.excerptEn}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t('min_read', { minutes: DEMO_READ_LATER.minutes })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile audit sheet */}
      <Sheet open={isAudit && mobileAuditOpen} onOpenChange={setMobileAuditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t('audit_title')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 h-[calc(100%-3rem)] overflow-y-auto pb-6">
            <AuditPanelBody
              selectedId={selectedId}
              onSelect={setSelectedId}
              onEnterCalm={enterCalm}
              onBack={backStandard}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
