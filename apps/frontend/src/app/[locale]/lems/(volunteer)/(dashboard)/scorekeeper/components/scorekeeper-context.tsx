'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import dayjs from 'dayjs';
import { MATCH_LOAD_THRESHOLD } from '@lems/shared/consts';
import { useTime } from '../../../../../../../lib/time/hooks';
import { AudienceDisplayState, Match, MatchStage, ScorekeeperData, Award } from '../graphql';

interface ScorekeeperContextType {
  matches: Match[];
  audienceDisplay: AudienceDisplayState | null;
  matchLength: number;
  currentStage: MatchStage;
  loadedMatch: Match | null;
  activeMatch: Match | null;
  testMatch: Match | null;
  nextMatch: Match | null;
  awardsAssigned: boolean;
  judging: {
    awards: Award[];
  } | null;
  field: ScorekeeperData['division']['field'] | null;
}

const ScorekeeperContext = createContext<ScorekeeperContextType | null>(null);

interface ScorekeeperProviderProps {
  data: ScorekeeperData['division'];
  children?: ReactNode;
}

export function ScorekeeperProvider({ data, children }: ScorekeeperProviderProps) {
  const field = data.field;
  const {
    matches,
    audienceDisplay,
    matchLength,
    currentStage,
    loadedMatch: loadedMatchId,
    activeMatch: activeMatchId
  } = field;

  const currentTime = useTime({ interval: 1000 });

  const sortedMatches = useMemo(() => {
    return [...matches].sort(
      (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }, [matches]);

  const value = useMemo<ScorekeeperContextType>(() => {
    const activeMatch = activeMatchId
      ? sortedMatches.find(match => match.id === activeMatchId) || null
      : null;
    const loadedMatch = loadedMatchId
      ? sortedMatches.find(match => match.id === loadedMatchId) || null
      : null;
    const testMatch = sortedMatches.find(match => match.stage === 'TEST') || null;

    // Find the next unplayed match in the current stage for the
    // automatic match loading logic, and the load next match button
    let nextMatch =
      sortedMatches.find(match => match.stage === currentStage && match.status === 'not-started') ||
      null;

    if (loadedMatch && loadedMatch.id === nextMatch?.id) {
      nextMatch = null;
    }

    if (nextMatch) {
      const scheduledTime = dayjs(nextMatch.scheduledTime);
      const minutesUntilStart = scheduledTime.diff(currentTime, 'minute', true);
      if (minutesUntilStart > MATCH_LOAD_THRESHOLD) {
        nextMatch = null;
      }
    }

    return {
      matches: sortedMatches,
      audienceDisplay,
      matchLength,
      currentStage,
      loadedMatch,
      activeMatch,
      testMatch,
      nextMatch,
      awardsAssigned: data.awardsAssigned,
      judging: data.judging || null,
      field: field || null
    };
  }, [
    activeMatchId,
    loadedMatchId,
    sortedMatches,
    matchLength,
    currentStage,
    currentTime,
    audienceDisplay,
    data.awardsAssigned,
    data.judging,
    field
  ]);

  return <ScorekeeperContext.Provider value={value}>{children}</ScorekeeperContext.Provider>;
}

export function useScorekeeperData(): ScorekeeperContextType {
  const context = useContext(ScorekeeperContext);
  if (!context) {
    throw new Error('useScorekeeperData must be used within a ScorekeeperProvider');
  }
  return context;
}
