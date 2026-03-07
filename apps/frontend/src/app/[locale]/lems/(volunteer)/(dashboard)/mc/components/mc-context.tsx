'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { Match, MatchStage, Award } from '../graphql/types';

interface McContextType {
  matches: Match[];
  currentStage: MatchStage;
  loadedMatch: string | null;
  awardsAssigned: boolean;
  awards: Award[];
  isAdvancementEnabled: boolean;
  loading: boolean;
}

const McContext = createContext<McContextType | null>(null);

interface McProviderProps {
  matches: Match[];
  currentStage: MatchStage;
  loadedMatch: string | null;
  awardsAssigned: boolean;
  awards: Award[];
  isAdvancementEnabled: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export function McProvider({
  matches,
  currentStage,
  loadedMatch,
  awardsAssigned,
  awards,
  isAdvancementEnabled,
  loading = false,
  children
}: McProviderProps) {
  const value = useMemo<McContextType>(
    () => ({
      matches,
      currentStage,
      loadedMatch,
      awardsAssigned,
      awards,
      isAdvancementEnabled,
      loading
    }),
    [matches, currentStage, loadedMatch, awardsAssigned, awards, isAdvancementEnabled, loading]
  );

  return <McContext.Provider value={value}>{children}</McContext.Provider>;
}

export function useMc() {
  const context = useContext(McContext);
  if (!context) {
    throw new Error('useMc must be used within a McProvider');
  }
  return context;
}
