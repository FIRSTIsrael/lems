import { Dayjs } from 'dayjs';

export type ScheduleBlockType = 'practice-match' | 'ranking-match' | 'judging-session' | 'break';
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

export interface CalendarState {
  blocks: ScheduleBlock[];
  practiceRounds: number;
  rankingRounds: number;
  judgingStartTime: Dayjs;
  fieldStartTime: Dayjs;
}

export interface DragState {
  isDragging: boolean;
  draggedBlock?: ScheduleBlock;
  dragStartY: number;
  draggedPosition: number;
  originalPosition: number;
}

// Time constants
export const MINUTES_PER_SLOT = 5;
export const TIME_SLOT_HEIGHT = 4; // pixels per minute
export const COLUMN_WIDTH = 400;
export const TIME_AXIS_WIDTH = 80;

// Colors for different block types
export const BLOCK_COLORS = {
  'practice-match': '#4CAF50',
  'ranking-match': '#2196F3',
  'judging-session': '#FF9800',
  break: '#757575'
} as const;
