'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTime } from '../../../../../../../../lib/time/hooks';
import type { Match } from '../graphql/types';

interface FieldTimerContextType {
  activeMatch: Match | null;
  nextMatch: Match | null;
  matchEndTime: Date;
  percentRemaining: number;
  currentTime: Dayjs;
}

const FieldTimerContext = createContext<FieldTimerContextType | null>(null);

interface FieldTimerProviderProps {
  matches: Match[];
  activeMatchId: string | null;
  matchLength: number;
  children: ReactNode;
}

export function FieldTimerProvider({
  matches,
  activeMatchId,
  matchLength,
  children
}: FieldTimerProviderProps) {
  const currentTime = useTime({ interval: 500 });

  const activeMatch = useMemo(() => {
    return matches.find(m => m.id === activeMatchId) || null;
  }, [matches, activeMatchId]);

  const nextMatch = useMemo(() => {
    if (activeMatch) return null;
    return matches.find(m => m.status === 'not-started' && m.stage !== 'TEST') || null;
  }, [matches, activeMatch]);

  const matchEndTime = useMemo(() => {
    if (activeMatch?.startTime) {
      return dayjs(activeMatch.startTime).add(matchLength, 'seconds').toDate();
    }
    // For no-match state, show 0:00 by setting a time that has already passed
    return new Date(0);
  }, [activeMatch, matchLength]);

  const percentRemaining = useMemo(() => {
    if (!matchEndTime) return 100;
    const remaining = dayjs(matchEndTime).diff(currentTime, 'milliseconds');
    const total = matchLength * 1000;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }, [matchEndTime, currentTime, matchLength]);

  const value = useMemo<FieldTimerContextType>(
    () => ({
      activeMatch,
      nextMatch,
      matchEndTime,
      percentRemaining,
      currentTime
    }),
    [activeMatch, nextMatch, matchEndTime, percentRemaining, currentTime]
  );

  return <FieldTimerContext.Provider value={value}>{children}</FieldTimerContext.Provider>;
}

export function useFieldTimer() {
  const context = useContext(FieldTimerContext);
  if (!context) {
    throw new Error('useFieldTimer must be used within a FieldTimerProvider');
  }
  return context;
}
