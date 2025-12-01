import { Dayjs } from 'dayjs';
import { TIME_SLOT_HEIGHT, HEADER_HEIGHT } from '../calendar-types';

const SNAP_MINUTES = 5;

/**
 * Convert a Dayjs time to its pixel position in the calendar
 * Returns document coordinates (includes HEADER_HEIGHT)
 */
export function timeToPosition(time: Dayjs, startTime: Dayjs): number {
  const minutesFromStart = time.diff(startTime, 'minute');
  return minutesFromStart * TIME_SLOT_HEIGHT + HEADER_HEIGHT;
}

/**
 * Convert a pixel position to a Dayjs time
 */
export function positionToTime(position: number, startTime: Dayjs): Dayjs {
  const adjustedPosition = position - HEADER_HEIGHT;
  const minutesFromStart = adjustedPosition / TIME_SLOT_HEIGHT;
  const currentTime = startTime.add(minutesFromStart, 'minute');
  return currentTime;
}

/**
 * Snap a Y position to the nearest grid interval (5-minute intervals)
 */
export function snapToGrid(yPosition: number, startTime: Dayjs): number {
  const currentTime = positionToTime(yPosition, startTime);
  const currentMinute = currentTime.minute();
  const snappedMinute = Math.round(currentMinute / SNAP_MINUTES) * SNAP_MINUTES;
  const snappedTime = currentTime.minute(snappedMinute).second(0);
  return timeToPosition(snappedTime, startTime);
}

export const SNAP_MINUTES_VALUE = SNAP_MINUTES;
export const MIN_SNAP_DURATION = SNAP_MINUTES * 60; // 5 minutes in seconds
