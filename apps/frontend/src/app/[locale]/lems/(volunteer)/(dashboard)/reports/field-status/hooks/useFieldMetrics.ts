'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';

interface Match {
  id: string;
  scheduledTime: string;
  status: string;
  startTime?: string | null;
  startDelta?: number | null;
}

/**
 * Hook for calculating field performance metrics
 * Provides statistics about delays, on-time performance, and completion rates
 */
export function useFieldMetrics(matches: Match[] = []) {
  const metrics = useMemo(() => {
    const completedMatches = matches.filter(m => m.status === 'completed');
    const totalMatches = matches.filter(m => m.status !== 'test').length;

    // Completion rate
    const completionRate = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0;

    // On-time performance (within 2 minutes of schedule)
    const onTimeMatches = completedMatches.filter(
      m => m.startDelta !== null && Math.abs(m.startDelta) <= 120
    );
    const onTimeRate =
      completedMatches.length > 0 ? (onTimeMatches.length / completedMatches.length) * 100 : 0;

    // Average delay
    const delaysInSeconds = completedMatches
      .filter(m => m.startDelta !== null)
      .map(m => m.startDelta!);

    const averageDelay =
      delaysInSeconds.length > 0
        ? delaysInSeconds.reduce((sum, delay) => sum + delay, 0) / delaysInSeconds.length
        : 0;

    // Largest delay
    const largestDelay =
      delaysInSeconds.length > 0 ? Math.max(...delaysInSeconds.map(d => Math.abs(d))) : 0;

    // Current pace (based on last 5 matches)
    const recentMatches = completedMatches.slice(-5);
    const recentDelays = recentMatches.filter(m => m.startDelta !== null).map(m => m.startDelta!);

    const currentPace =
      recentDelays.length > 0
        ? recentDelays.reduce((sum, delay) => sum + delay, 0) / recentDelays.length
        : 0;

    // Estimated time behind/ahead
    const estimatedOffset = currentPace;

    return {
      totalMatches,
      completedMatches: completedMatches.length,
      completionRate,
      onTimeMatches: onTimeMatches.length,
      onTimeRate,
      averageDelay,
      largestDelay,
      currentPace,
      estimatedOffset,
      isOnTrack: currentPace >= -120, // Within 2 minutes
      isBehind: currentPace < 0
    };
  }, [matches]);

  return metrics;
}

/**
 * Format seconds into human-readable time string
 */
export function formatDuration(seconds: number): string {
  const absSeconds = Math.abs(seconds);
  const minutes = Math.floor(absSeconds / 60);
  const secs = Math.floor(absSeconds % 60);

  const sign = seconds < 0 ? '-' : '+';

  if (minutes === 0) {
    return `${sign}${secs}s`;
  }

  return `${sign}${minutes}m ${secs}s`;
}

/**
 * Format seconds into minutes
 */
export function formatMinutes(seconds: number): string {
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)} min`;
}
