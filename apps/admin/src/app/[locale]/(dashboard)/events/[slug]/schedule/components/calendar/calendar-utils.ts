import { Dayjs } from 'dayjs';
import { ScheduleBlock, ScheduleColumn, TIME_SLOT_HEIGHT } from './calendar-types';

export function getBlockColumn(block: ScheduleBlock): ScheduleColumn {
  if (block.type === 'judging-session') return 'judging';
  return 'field';
}

export function calculateBlockPosition(startTime: Dayjs, block: ScheduleBlock) {
  const minutesFromStart = block.startTime.diff(startTime, 'minute');

  return {
    top: minutesFromStart * TIME_SLOT_HEIGHT,
    height: (block.durationSeconds / 60) * TIME_SLOT_HEIGHT
  };
}

export function getDuration(date: Dayjs): number {
  return date.hour() * 3600 + date.minute() * 60 + date.second();
}
