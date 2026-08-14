'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { HOOKLENS_SAMPLES } from '@/config/hooklens/samples';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [image, setImage] = useState<ActiveImage | null>(null);
  const [appName, setAppName] = useState('');

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
  };

  const clearAll = () => {
    clearObjectUrl();
    setImage(null);
    setAppName('');
    if (inputRef.current) inputRef.current.value = '';
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
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

          <div
            className={cn(
              'bg-muted/40 relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border border-dashed',
              image && 'border-solid bg-background'
            )}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={t('current_image')}
                className="max-h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-3 px-6 text-center">
                <ImageIcon className="size-10 opacity-50" />
                <p>{t('canvas_empty')}</p>
              </div>
            )}
          </div>

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
                const selected = image?.sampleId === sample.id;
                return (
                  <li key={sample.id}>
                    <button
                      type="button"
                      onClick={() => selectSample(sample.id)}
                      className={cn(
                        'hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors',
                        selected && 'border-primary bg-muted/40'
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
        </aside>
      </div>
    </div>
  );
}
