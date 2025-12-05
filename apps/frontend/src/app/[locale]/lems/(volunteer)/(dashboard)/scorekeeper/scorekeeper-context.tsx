'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { Match, MatchStage } from './scorekeeper.graphql';

interface ScorekeeperContextType {
  // Raw data
  matches: Match[];
  matchLength: number;
  currentStage: MatchStage;
  loadedMatchId: string | null;
  activeMatchId: string | null;

  // Computed values
  currentMatch: Match | null;
  loadedMatch: Match | null;
  nextUnplayedMatch: Match | null;
  hasActiveMatch: boolean;
  hasLoadedMatch: boolean;
  hasNextUnplayedMatch: boolean;
  allParticipantsReady: boolean;
}

const ScorekeeperContext = createContext<ScorekeeperContextType | null>(null);

interface ScorekeeperProviderProps {
  children: ReactNode;
  matches: Match[];
  matchLength: number;
  currentStage: MatchStage;
  loadedMatchId: string | null;
  activeMatchId: string | null;
}

export function ScorekeeperProvider({
  children,
  matches,
  matchLength,
  currentStage,
  loadedMatchId,
  activeMatchId
}: ScorekeeperProviderProps) {
  const value = useMemo<ScorekeeperContextType>(() => {
    // Computed: Current Match
    const currentMatch = activeMatchId ? matches.find(m => m.id === activeMatchId) || null : null;

    // Computed: Loaded Match
    const loadedMatch = loadedMatchId ? matches.find(m => m.id === loadedMatchId) || null : null;

    // Computed: Next Unplayed Match
    const nextUnplayedMatch =
      matches.find(m => m.status === 'not-started' && m.stage !== 'TEST') || null;

    // Computed: Flags
    const hasActiveMatch = !!currentMatch;
    const hasLoadedMatch = !!loadedMatch;
    const hasNextUnplayedMatch = !!nextUnplayedMatch;
    const allParticipantsReady = loadedMatch?.participants?.every(p => p.team) ?? false;

    return {
      matches,
      matchLength,
      currentStage,
      loadedMatchId,
      activeMatchId,
      currentMatch,
      loadedMatch,
      nextUnplayedMatch,
      hasActiveMatch,
      hasLoadedMatch,
      hasNextUnplayedMatch,
      allParticipantsReady
    };
  }, [matches, matchLength, currentStage, loadedMatchId, activeMatchId]);

  return <ScorekeeperContext.Provider value={value}>{children}</ScorekeeperContext.Provider>;
}

export function useScorekeeperData(): ScorekeeperContextType {
  const context = useContext(ScorekeeperContext);
  if (!context) {
    throw new Error('useScorekeeperData must be used within a ScorekeeperProvider');
  }
  return context;
}
