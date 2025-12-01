import { Dayjs } from 'dayjs';

export type DragMode = 'body' | 'top-edge' | 'bottom-edge' | 'create' | null;

export interface AgendaDragState {
  mode: DragMode;
  blockId?: string;
  startY: number;
  originalStartTime?: Dayjs;
  originalDuration?: number;
  draggedPosition: number;
  createStartPosition?: number; // For drag-to-create: where the drag started
  createCurrentPosition?: number; // For drag-to-create: current drag position
  dragStartPosition?: number; // For body drag: snapped position where drag started
}

export const DEFAULT_EVENT_DURATION = 60 * 60; // 1 hour in seconds
export const MIN_CREATE_DURATION = 5 * 60; // 5 minutes in seconds
