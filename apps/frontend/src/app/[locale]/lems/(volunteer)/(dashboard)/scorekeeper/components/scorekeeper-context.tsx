'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Match, MatchStage, ScorekeeperData } from '../scorekeeper.graphql';

interface ScorekeeperContextType {
  matches: Match[];

  matchLength: number;
  currentStage: MatchStage;
  loadedMatch: Match | null;
  activeMatch: Match | null;
}

const ScorekeeperContext = createContext<ScorekeeperContextType | null>(null);

interface ScorekeeperProviderProps {
  data: ScorekeeperData['division']['field'];
  children?: ReactNode;
}

export function ScorekeeperProvider({ data, children }: ScorekeeperProviderProps) {
  const {
    matches,
    matchLength,
    currentStage,
    loadedMatch: loadedMatchId,
    activeMatch: activeMatchId
  } = data;

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

    return {
      matches: sortedMatches,
      matchLength,
      currentStage,
      loadedMatch,
      activeMatch
    };
  }, [activeMatchId, loadedMatchId, sortedMatches, matchLength, currentStage]);

  return <ScorekeeperContext.Provider value={value}>{children}</ScorekeeperContext.Provider>;
}

export function useScorekeeperData(): ScorekeeperContextType {
  const context = useContext(ScorekeeperContext);
  if (!context) {
    throw new Error('useScorekeeperData must be used within a ScorekeeperProvider');
  }
  return context;
}
