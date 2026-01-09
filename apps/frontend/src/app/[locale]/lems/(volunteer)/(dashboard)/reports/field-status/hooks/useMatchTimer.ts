'use client';

import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

export type UrgencyLevel = 'ahead' | 'close' | 'behind' | 'done';

export interface UseMatchTimerOptions {
  scheduledTime?: string | null;
  enabled?: boolean;
}

/**
 * Hook for match countdown timer calculations
 * Provides time until match, urgency level, and progress
 */
export function useMatchTimer({ scheduledTime, enabled = true }: UseMatchTimerOptions) {
  const [currentTime, setCurrentTime] = useState(() => dayjs());

  useEffect(() => {
    if (!enabled || !scheduledTime) return;

    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, scheduledTime]);

  const timeUntilMatch = useMemo(() => {
    if (!scheduledTime) return null;
    return dayjs(scheduledTime).diff(currentTime, 'seconds');
  }, [scheduledTime, currentTime]);

  const urgency = useMemo<UrgencyLevel>(() => {
    if (!scheduledTime) return 'done';

    const diff = dayjs(scheduledTime).diff(currentTime, 'seconds');
    const twoMinutes = 2 * 60;

    if (diff > twoMinutes) return 'ahead';
    if (diff > 0) return 'close';
    if (diff > -twoMinutes) return 'behind';
    return 'behind';
  }, [scheduledTime, currentTime]);

  const progress = useMemo(() => {
    if (!scheduledTime) return 0;

    const twoMinutes = 2 * 60;
    const diff = dayjs(scheduledTime).diff(currentTime, 'seconds');

    return (Math.abs(Math.min(twoMinutes, diff)) / twoMinutes) * 100;
  }, [scheduledTime, currentTime]);

  const formattedTime = useMemo(() => {
    if (!timeUntilMatch) return null;

    const absSeconds = Math.abs(timeUntilMatch);
    const hours = Math.floor(absSeconds / 3600);
    const minutes = Math.floor((absSeconds % 3600) / 60);
    const seconds = absSeconds % 60;

    const sign = timeUntilMatch < 0 ? '-' : '';

    if (hours > 0) {
      return `${sign}${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${sign}${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [timeUntilMatch]);

  return {
    currentTime,
    timeUntilMatch,
    urgency,
    progress,
    formattedTime,
    isLate: timeUntilMatch !== null && timeUntilMatch < 0
  };
}
