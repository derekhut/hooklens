import type { HookPatternId } from './hooks';

/** Normalized rect relative to the image content box (0–1). */
export type AnnotationRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Annotation = {
  id: string;
  hookId: HookPatternId;
  label: string;
  note: string;
  severity: 1 | 2 | 3;
  rect: AnnotationRect;
};

export function createAnnotationId() {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
