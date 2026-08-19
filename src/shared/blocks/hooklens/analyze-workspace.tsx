'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FileText,
  ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import {
  formatHookOptionLabel,
  getHookPattern,
  HOOK_DIMENSIONS,
  HOOK_PATTERNS,
  patternsByDimension,
} from '@/config/hooklens/hooks';
import {
  persistImageForReport,
  saveReport,
  type HooklensReport,
} from '@/config/hooklens/report-storage';
import { HOOKLENS_SAMPLES } from '@/config/hooklens/samples';
import {
  Annotation,
  AnnotationRect,
  createAnnotationId,
} from '@/config/hooklens/types';
import { useRouter } from '@/core/i18n/navigation';
import { ScreenshotAnnotator } from '@/shared/blocks/hooklens/screenshot-annotator';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { imageUrlToJpegDataUrl } from '@/shared/lib/hooklens/image-data-url';
import { cn } from '@/shared/lib/utils';

type ActiveImage = {
  url: string;
  source: 'upload' | 'sample';
  sampleId?: string;
};

const primaryBtn =
  'rounded-xl bg-[#2F6BFF] text-white hover:bg-[#2458d9]';
const ghostBtn =
  'rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-50';

function severityTone(level: 1 | 2 | 3) {
  if (level === 3) return 'border-rose-300 text-rose-600';
  if (level === 2) return 'border-amber-300 text-amber-700';
  return 'border-slate-300 text-slate-600';
}

export function AnalyzeWorkspace() {
  const t = useTranslations('hooklens.analyze');
  const locale = useLocale();
  const isZh = locale.startsWith('zh');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [image, setImage] = useState<ActiveImage | null>(null);
  const [appName, setAppName] = useState('');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const selected = useMemo(
    () => annotations.find((a) => a.id === selectedId) ?? null,
    [annotations, selectedId]
  );

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const clearObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const resetAnnotations = () => {
    setAnnotations([]);
    setSelectedId(null);
  };

  const selectSample = (sampleId: string) => {
    const sample = HOOKLENS_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;
    clearObjectUrl();
    setImage({
      url: sample.imageUrl,
      source: 'sample',
      sampleId: sample.id,
    });
    setAppName(isZh ? sample.appNameZh : sample.appNameEn);
    resetAnnotations();
  };

  const onFileChange = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    clearObjectUrl();
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setImage({ url, source: 'upload' });
    if (!appName.trim()) {
      setAppName(file.name.replace(/\.[^.]+$/, ''));
    }
    resetAnnotations();
  };

  const clearAll = () => {
    clearObjectUrl();
    setImage(null);
    setAppName('');
    resetAnnotations();
    if (inputRef.current) inputRef.current.value = '';
  };

  const onCreate = (rect: AnnotationRect) => {
    const hook = HOOK_PATTERNS[0];
    const ann: Annotation = {
      id: createAnnotationId(),
      hookId: hook.id,
      label: isZh ? hook.nameZh : hook.nameEn,
      note: '',
      severity: 2,
      rect,
    };
    setAnnotations((prev) => [...prev, ann]);
    setSelectedId(ann.id);
  };

  const updateSelected = (patch: Partial<Annotation>) => {
    if (!selectedId) return;
    setAnnotations((prev) =>
      prev.map((a) => {
        if (a.id !== selectedId) return a;
        const next = { ...a, ...patch };
        if (patch.hookId) {
          const hook = getHookPattern(patch.hookId);
          if (hook) {
            next.label = isZh ? hook.nameZh : hook.nameEn;
          }
        }
        return next;
      })
    );
  };

  const removeSelected = () => {
    if (!selectedId) return;
    setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
    setSelectedId(null);
  };

  const detectWithAi = async () => {
    if (!image) {
      toast.error(t('report_need_image'));
      return;
    }

    setDetecting(true);
    try {
      const imageDataUrl = await imageUrlToJpegDataUrl(image.url);
      const res = await fetch('/api/hooklens/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageDataUrl,
          locale,
          appName: appName.trim(),
        }),
      });
      const json = (await res.json()) as {
        code: number;
        message?: string;
        data?: {
          annotations?: Array<{
            hookId: Annotation['hookId'];
            label: string;
            note: string;
            severity: 1 | 2 | 3;
            rect: AnnotationRect;
          }>;
        };
      };

      if (json.code !== 0 || !json.data?.annotations?.length) {
        toast.error(json.message || t('detect_failed'));
        return;
      }

      const next: Annotation[] = json.data.annotations.map((item) => ({
        id: createAnnotationId(),
        hookId: item.hookId,
        label: item.label,
        note: item.note,
        severity: item.severity,
        rect: item.rect,
      }));

      setAnnotations(next);
      setSelectedId(next[0]?.id ?? null);
      toast.success(t('detect_success', { count: next.length }));
    } catch {
      toast.error(t('detect_failed'));
    } finally {
      setDetecting(false);
    }
  };

  const generateReport = async () => {
    if (!image) {
      toast.error(t('report_need_image'));
      return;
    }
    if (annotations.length < 1) {
      toast.error(t('report_need_annotations'));
      return;
    }

    setGenerating(true);
    try {
      const imageUrl = await persistImageForReport(image.url);
      const res = await fetch('/api/hooklens/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: appName.trim(),
          imageUrl,
          annotations,
          locale,
        }),
      });
      const json = (await res.json()) as {
        code: number;
        message?: string;
        data?: HooklensReport & { polished?: boolean };
      };
      if (json.code !== 0 || !json.data?.id) {
        throw new Error(json.message || 'create failed');
      }
      saveReport(json.data);
      router.push(`/report/${json.data.id}`);
    } catch {
      toast.error(t('report_failed'));
    } finally {
      setGenerating(false);
    }
  };

  const hookName = (id: string) => {
    const hook = getHookPattern(id);
    if (!hook) return id;
    return formatHookOptionLabel(hook, locale);
  };

  const acceptFile = (file: File | undefined) => onFileChange(file);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F4F6FA]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-[#2F6BFF] uppercase">
              {t('kicker')}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-sm text-slate-500">{t('description')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            <Button
              type="button"
              className={primaryBtn}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="size-4" />
              {t('upload')}
            </Button>
            {image && (
              <Button
                type="button"
                variant="secondary"
                className={ghostBtn}
                disabled={detecting}
                onClick={detectWithAi}
              >
                {detecting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {detecting ? t('detecting') : t('detect_ai')}
              </Button>
            )}
            {image && (
              <Button
                type="button"
                variant="outline"
                className={ghostBtn}
                onClick={clearAll}
              >
                <X className="size-4" />
                {t('clear')}
              </Button>
            )}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
          <aside className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
            <h2 className="px-1 text-sm font-medium text-slate-900">
              {t('samples_heading')}
            </h2>
            <ul className="space-y-2">
              {HOOKLENS_SAMPLES.map((sample) => {
                const isSelected = image?.sampleId === sample.id;
                return (
                  <li key={sample.id}>
                    <button
                      type="button"
                      onClick={() => selectSample(sample.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border p-2 text-left transition',
                        isSelected
                          ? 'border-[#2F6BFF] bg-[#EEF3FF]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sample.imageUrl}
                        alt=""
                        className="h-14 w-12 shrink-0 rounded-md bg-slate-100 object-cover object-top"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-800">
                          {isZh ? sample.appNameZh : sample.appNameEn}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {isZh ? sample.titleZh : sample.titleEn}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
          >
            {image ? (
              <ScreenshotAnnotator
                imageUrl={image.url}
                imageAlt={t('current_image')}
                annotations={annotations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onCreate={onCreate}
                drawHint={t('draw_hint')}
              />
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'flex min-h-[480px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center transition',
                  dragging
                    ? 'border-[#2F6BFF] bg-[#EEF3FF]'
                    : 'border-slate-300 bg-white hover:border-[#2F6BFF]/60'
                )}
              >
                <ImageIcon className="size-10 text-slate-300" />
                <p className="text-base font-medium text-slate-800">
                  {t('dropzone_title')}
                </p>
                <p className="max-w-sm text-sm text-slate-500">
                  {t('dropzone_hint')}
                </p>
              </button>
            )}
          </section>

          <aside className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="space-y-2">
              <Label htmlFor="hooklens-app-name">{t('app_name_label')}</Label>
              <Input
                id="hooklens-app-name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder={t('app_name_placeholder')}
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-medium tracking-wide text-[#2F6BFF] uppercase">
                  {t('output_heading')}
                </p>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t('annotations_heading')}
                </h2>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-[#2F6BFF]/30 text-[#2F6BFF]"
              >
                {t('annotations_count', { count: annotations.length })}
              </Badge>
            </div>

            {!image && (
              <p className="text-sm text-slate-500">{t('output_body')}</p>
            )}

            {image && annotations.length === 0 && (
              <p className="text-sm text-slate-500">{t('annotations_empty')}</p>
            )}

            <ul className="max-h-44 space-y-2 overflow-y-auto">
              {annotations.map((ann, index) => (
                <li key={ann.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(ann.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                      selectedId === ann.id
                        ? 'border-[#2F6BFF] bg-[#EEF3FF]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2F6BFF] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
                      {hookName(ann.hookId)}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 text-[10px]',
                        severityTone(ann.severity)
                      )}
                    >
                      {t('severity_short', { level: ann.severity })}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
                <div className="space-y-2">
                  <Label>{t('hook_type')}</Label>
                  <Select
                    value={selected.hookId}
                    onValueChange={(value) =>
                      updateSelected({
                        hookId: value as Annotation['hookId'],
                      })
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOOK_DIMENSIONS.map((dim) => (
                        <SelectGroup key={dim.id}>
                          <SelectLabel>
                            {dim.id}. {isZh ? dim.nameZh : dim.nameEn}
                          </SelectLabel>
                          {patternsByDimension(dim.id).map((hook) => (
                            <SelectItem key={hook.id} value={hook.id}>
                              {formatHookOptionLabel(hook, locale)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hooklens-note">{t('note_label')}</Label>
                  <Textarea
                    id="hooklens-note"
                    value={selected.note}
                    onChange={(e) => updateSelected({ note: e.target.value })}
                    placeholder={t('note_placeholder')}
                    rows={3}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('severity_label')}</Label>
                  <Select
                    value={String(selected.severity)}
                    onValueChange={(value) =>
                      updateSelected({
                        severity: Number(value) as 1 | 2 | 3,
                      })
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">{t('severity_1')}</SelectItem>
                      <SelectItem value="2">{t('severity_2')}</SelectItem>
                      <SelectItem value="3">{t('severity_3')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn('w-full', ghostBtn)}
                  onClick={removeSelected}
                >
                  <Trash2 className="size-4" />
                  {t('delete_annotation')}
                </Button>
              </div>
            )}

            <div className="mt-auto space-y-2 pt-2">
              <p className="text-xs text-slate-400">{t('coming_next')}</p>
              <Button
                type="button"
                className={cn('w-full', primaryBtn)}
                disabled={!image || annotations.length < 1 || generating}
                onClick={generateReport}
              >
                {generating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <FileText className="size-4" />
                )}
                {generating ? t('generating') : t('generate_report')}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
