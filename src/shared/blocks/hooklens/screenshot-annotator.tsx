'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type { Annotation, AnnotationRect } from '@/config/hooklens/types';
import { cn } from '@/shared/lib/utils';

type ContentBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function getContentBox(img: HTMLImageElement): ContentBox {
  const rect = img.getBoundingClientRect();
  const nw = img.naturalWidth || 1;
  const nh = img.naturalHeight || 1;
  const imageAspect = nw / nh;
  const elementAspect = rect.width / Math.max(rect.height, 1);

  if (imageAspect > elementAspect) {
    const width = rect.width;
    const height = rect.width / imageAspect;
    return {
      left: rect.left,
      top: rect.top + (rect.height - height) / 2,
      width,
      height,
    };
  }

  const height = rect.height;
  const width = rect.height * imageAspect;
  return {
    left: rect.left + (rect.width - width) / 2,
    top: rect.top,
    width,
    height,
  };
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function normalizeRect(
  a: { x: number; y: number },
  b: { x: number; y: number }
): AnnotationRect {
  const x1 = clamp01(Math.min(a.x, b.x));
  const y1 = clamp01(Math.min(a.y, b.y));
  const x2 = clamp01(Math.max(a.x, b.x));
  const y2 = clamp01(Math.max(a.y, b.y));
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function pointInContent(
  clientX: number,
  clientY: number,
  box: ContentBox
): { x: number; y: number } {
  return {
    x: clamp01((clientX - box.left) / Math.max(box.width, 1)),
    y: clamp01((clientY - box.top) / Math.max(box.height, 1)),
  };
}

type ScreenshotAnnotatorProps = {
  imageUrl: string;
  imageAlt: string;
  annotations: Annotation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: (rect: AnnotationRect) => void;
  drawHint: string;
  className?: string;
};

export function ScreenshotAnnotator({
  imageUrl,
  imageAlt,
  annotations,
  selectedId,
  onSelect,
  onCreate,
  drawHint,
  className,
}: ScreenshotAnnotatorProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [box, setBox] = useState<ContentBox | null>(null);
  const [draft, setDraft] = useState<AnnotationRect | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const drawingRef = useRef(false);

  const refreshBox = useCallback(() => {
    const img = imgRef.current;
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const next = getContentBox(img);
    const wrap = wrapRef.current?.getBoundingClientRect();
    if (!wrap) {
      setBox(next);
      return;
    }
    // Store box relative to wrap for absolute positioning of overlays
    setBox({
      left: next.left - wrap.left,
      top: next.top - wrap.top,
      width: next.width,
      height: next.height,
    });
  }, []);

  useEffect(() => {
    refreshBox();
    const onResize = () => refreshBox();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [imageUrl, refreshBox]);

  const clientToNorm = (clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return null;
    return pointInContent(clientX, clientY, getContentBox(img));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const point = clientToNorm(e.clientX, e.clientY);
    if (!point) return;
    drawingRef.current = true;
    dragStartRef.current = point;
    setDraft({ x: point.x, y: point.y, w: 0, h: 0 });
    onSelect(null);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current || !dragStartRef.current) return;
    const point = clientToNorm(e.clientX, e.clientY);
    if (!point) return;
    setDraft(normalizeRect(dragStartRef.current, point));
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawingRef.current || !dragStartRef.current) return;
    drawingRef.current = false;
    const point = clientToNorm(e.clientX, e.clientY);
    const start = dragStartRef.current;
    dragStartRef.current = null;
    setDraft(null);
    if (!point) return;
    const rect = normalizeRect(start, point);
    if (rect.w < 0.02 || rect.h < 0.02) return;
    onCreate(rect);
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        'bg-background relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-xl border',
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageUrl}
        alt={imageAlt}
        draggable={false}
        onLoad={refreshBox}
        className="max-h-[70vh] w-full select-none object-contain"
      />

      {box && (
        <div
          className="absolute touch-none"
          style={{
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {annotations.map((ann, index) => {
            const selected = ann.id === selectedId;
            return (
              <button
                key={ann.id}
                type="button"
                aria-label={ann.label}
                className={cn(
                  'absolute border-2 bg-amber-400/20 text-left transition-colors',
                  selected
                    ? 'border-amber-500 ring-2 ring-amber-500/40'
                    : 'border-amber-500/80 hover:bg-amber-400/30'
                )}
                style={{
                  left: `${ann.rect.x * 100}%`,
                  top: `${ann.rect.y * 100}%`,
                  width: `${ann.rect.w * 100}%`,
                  height: `${ann.rect.h * 100}%`,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelect(ann.id);
                }}
              >
                <span className="absolute -top-5 left-0 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {index + 1}
                </span>
              </button>
            );
          })}

          {draft && draft.w > 0 && draft.h > 0 && (
            <div
              className="pointer-events-none absolute border-2 border-dashed border-amber-500 bg-amber-400/15"
              style={{
                left: `${draft.x * 100}%`,
                top: `${draft.y * 100}%`,
                width: `${draft.w * 100}%`,
                height: `${draft.h * 100}%`,
              }}
            />
          )}
        </div>
      )}

      <p className="text-muted-foreground pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs backdrop-blur">
        {drawHint}
      </p>
    </div>
  );
}
