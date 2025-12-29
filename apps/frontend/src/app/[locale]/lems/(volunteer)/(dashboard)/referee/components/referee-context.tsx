'use client';

import { createContext, useContext, useMemo, ReactNode, useState } from 'react';
import { useTime } from '../../../../../../../lib/time/hooks';
import type { RefereeMatch, RefereeFieldData } from '../graphql/types';

interface RefereeContextType {
  matches: RefereeMatch[];
  loadedMatch: RefereeMatch | null;
  activeMatch: RefereeMatch | null;
  nextMatch: RefereeMatch | null;
  matchLength: number;
  tableId: string;
  inspectionStartTime: number | null;
  setInspectionStartTime: (time: number | null) => void;
  inspectionTimeRemaining: number | undefined;
}

const RefereeContext = createContext<RefereeContextType | null>(null);

interface RefereeProviderProps {
  data: RefereeFieldData;
  children?: ReactNode;
}

export function RefereeProvider({ data, children }: RefereeProviderProps) {
  const {
    matches,
    matchLength,
    loadedMatch: loadedMatchId,
    activeMatch: activeMatchId,
    tableId
  } = data;

  const currentTime = useTime({ interval: 1000 });
  const [inspectionStartTime, setInspectionStartTime] = useState<number | null>(null);
  const inspectionDuration = 5 * 60; // 5 minutes in seconds

  const sortedMatches = useMemo(() => {
    return [...matches].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }, [matches]);

  const inspectionTimeRemaining = useMemo(() => {
    if (!inspectionStartTime) return undefined;
    const elapsed = (currentTime.valueOf() - inspectionStartTime) / 1000;
    return Math.max(0, inspectionDuration - elapsed);
  }, [inspectionStartTime, currentTime, inspectionDuration]);

  const value = useMemo<RefereeContextType>(() => {
    const active = activeMatchId
      ? sortedMatches.find(match => match.id === activeMatchId) || null
      : null;

    const loaded = loadedMatchId
      ? sortedMatches.find(match => match.id === loadedMatchId) || null
      : null;

    const nextIndex = active
      ? sortedMatches.findIndex(match => match.id === active.id) + 1
      : loaded
        ? sortedMatches.findIndex(match => match.id === loaded.id) + 1
        : 0;

    const next = nextIndex < sortedMatches.length ? sortedMatches[nextIndex] : null;

    return {
      matches: sortedMatches,
      activeMatch: active,
      loadedMatch: loaded,
      nextMatch: next,
      matchLength,
      tableId,
      inspectionStartTime,
      setInspectionStartTime,
      inspectionTimeRemaining
    };
  }, [
    sortedMatches,
    loadedMatchId,
    activeMatchId,
    matchLength,
    tableId,
    inspectionStartTime,
    inspectionTimeRemaining
  ]);

  return <RefereeContext.Provider value={value}>{children}</RefereeContext.Provider>;
}

export function useReferee() {
  const context = useContext(RefereeContext);
  if (!context) {
    throw new Error('useReferee must be used within RefereeProvider');
  }
  return context;
}
