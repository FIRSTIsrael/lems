import { Dayjs } from "dayjs";
import { HEADER_HEIGHT, INTERVAL_MINUTES, TIME_SLOT_HEIGHT } from "./calendar-types";

const SNAP_MINUTES = 5;

export const SNAP_MINUTES_VALUE = SNAP_MINUTES;
export const MIN_SNAP_DURATION = SNAP_MINUTES * 60; // 5 minutes in seconds

export function snapToGrid(yPosition: number, startTime: Dayjs): number {
  const currentTime = positionToTime(yPosition, startTime);

  // Snap to nearest 5-minute clock interval
  const currentMinute = currentTime.minute();
  const snappedMinute = Math.round(currentMinute / INTERVAL_MINUTES) * INTERVAL_MINUTES;
  const snappedTime = currentTime.minute(snappedMinute).second(0);

  return timeToPosition(snappedTime, startTime);
}

export function timeToPosition(time: Dayjs, startTime: Dayjs): number {
  const minutesFromStart = time.diff(startTime, 'minute');
  return minutesFromStart * TIME_SLOT_HEIGHT + HEADER_HEIGHT;
}

export function positionToTime(position: number, startTime: Dayjs): Dayjs {
  const adjustedPosition = position - HEADER_HEIGHT;
  const minutesFromStart = adjustedPosition / TIME_SLOT_HEIGHT;
  const currentTime = startTime.add(minutesFromStart, 'minute');
  return currentTime;
}
