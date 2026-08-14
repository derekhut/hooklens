'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FileText, ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { getHookPattern, HOOK_PATTERNS } from '@/config/hooklens/hooks';
import {
  buildReportSummary,
  createReportId,
  persistImageForReport,
  saveReport,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from '@/shared/lib/utils';

type ActiveImage = {
  url: string;
  source: 'upload' | 'sample';
  sampleId?: string;
};

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
      const id = createReportId();
      saveReport({
        id,
        appName: appName.trim(),
        imageUrl,
        annotations,
        summary: buildReportSummary(annotations, locale),
        createdAt: new Date().toISOString(),
      });
      router.push(`/report/${id}`);
    } catch {
      toast.error(t('report_failed'));
    } finally {
      setGenerating(false);
    }
  };

  const hookName = (id: string) => {
    const hook = getHookPattern(id);
    if (!hook) return id;
    return isZh ? hook.nameZh : hook.nameEn;
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 md:py-14">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {t('title')}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          {t('description')}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0])}
            />
            <Button type="button" onClick={() => inputRef.current?.click()}>
              <Upload className="size-4" />
              {t('upload')}
            </Button>
            {image && (
              <Button type="button" variant="outline" onClick={clearAll}>
                <X className="size-4" />
                {t('clear')}
              </Button>
            )}
            <span className="text-muted-foreground text-sm">
              {t('upload_hint')}
            </span>
          </div>

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
            <div className="bg-muted/40 flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 text-center">
              <ImageIcon className="text-muted-foreground size-10 opacity-50" />
              <p className="text-muted-foreground">{t('canvas_empty')}</p>
            </div>
          )}

          <p className="text-muted-foreground text-sm">{t('coming_next')}</p>
        </div>

        <aside className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hooklens-app-name">{t('app_name_label')}</Label>
            <Input
              id="hooklens-app-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder={t('app_name_placeholder')}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-medium">{t('samples_heading')}</h2>
            <ul className="space-y-2">
              {HOOKLENS_SAMPLES.map((sample) => {
                const isSelected = image?.sampleId === sample.id;
                return (
                  <li key={sample.id}>
                    <button
                      type="button"
                      onClick={() => selectSample(sample.id)}
                      className={cn(
                        'hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
                        isSelected && 'border-primary bg-muted/40'
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sample.imageUrl}
                        alt=""
                        className="bg-muted h-16 w-10 shrink-0 rounded object-cover object-top"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {isZh ? sample.appNameZh : sample.appNameEn}
                        </span>
                        <span className="text-muted-foreground block truncate text-xs">
                          {isZh ? sample.titleZh : sample.titleEn}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium">{t('annotations_heading')}</h2>
              <Badge variant="secondary">
                {t('annotations_count', { count: annotations.length })}
              </Badge>
            </div>

            {!image && (
              <p className="text-muted-foreground text-xs">
                {t('annotations_need_image')}
              </p>
            )}

            {image && annotations.length === 0 && (
              <p className="text-muted-foreground text-xs">
                {t('annotations_empty')}
              </p>
            )}

            <ul className="max-h-40 space-y-1 overflow-y-auto">
              {annotations.map((ann, index) => (
                <li key={ann.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(ann.id)}
                    className={cn(
                      'hover:bg-muted/60 flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm',
                      selectedId === ann.id && 'border-primary bg-muted/50'
                    )}
                  >
                    <span className="bg-amber-500 flex size-5 shrink-0 items-center justify-center rounded text-[10px] font-medium text-white">
                      {index + 1}
                    </span>
                    <span className="truncate">{hookName(ann.hookId)}</span>
                  </button>
                </li>
              ))}
            </ul>

            {selected && (
              <div className="space-y-3 rounded-lg border p-3">
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
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOOK_PATTERNS.map((hook) => (
                        <SelectItem key={hook.id} value={hook.id}>
                          {isZh ? hook.nameZh : hook.nameEn}
                        </SelectItem>
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
                    <SelectTrigger className="w-full">
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
                  className="w-full"
                  onClick={removeSelected}
                >
                  <Trash2 className="size-4" />
                  {t('delete_annotation')}
                </Button>
              </div>
            )}

            <Button
              type="button"
              className="w-full"
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
  );
}
