import { Dayjs } from 'dayjs';

export type ScheduleBlockType = 'practice-round' | 'ranking-round' | 'judging-session' | 'break';
export type ScheduleColumn = 'judging' | 'field';

export interface ScheduleBlock {
  id: string;
  type: ScheduleBlockType;
  column: ScheduleColumn;
  startTime: Dayjs;
  endTime: Dayjs;
  title: string;
  roundNumber?: number;
  isDragging?: boolean;
  canDelete?: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedBlock?: ScheduleBlock;
  dragStartY: number;
  draggedPosition: number;
  originalPosition: number;
}

export const INTERVAL_MINUTES = 5;
export const TIME_SLOT_HEIGHT = 3; // pixels per minute
export const TIME_AXIS_WIDTH = 80;
export const HEADER_HEIGHT = 40;

export const BLOCK_COLORS: Record<ScheduleBlockType, string> = {
  'practice-round': '#4CAF50',
  'ranking-round': '#2196F3',
  'judging-session': '#FF9800',
  break: '#757575'
} as const;
