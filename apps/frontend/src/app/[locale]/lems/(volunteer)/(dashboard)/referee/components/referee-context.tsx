'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { RefereeMatch, RefereeFieldData } from '../graphql/types';
import { useUser } from '../../../components/user-context';
import { hasTeamOnTable, sortMatchesByTime, getUnscoredScoresheets } from '../utils';

export type RefereeDisplayState = 'scoresheet' | 'timer' | 'prestart' | 'none';

interface RefereeContextType {
  loadedMatch: RefereeMatch | null;
  activeMatch: RefereeMatch | null;
  matchLength: number;
  tableId: string;
  displayState: RefereeDisplayState;
  upcomingMatches: RefereeMatch[];
  sortedMatches: RefereeMatch[];
}

function calculateDisplayState(
  sortedMatches: RefereeMatch[],
  tableId: string,
  activeMatch: RefereeMatch | null,
  loadedMatch: RefereeMatch | null
): RefereeDisplayState {
  if (activeMatch && activeMatch.status === 'in-progress') {
    return 'timer';
  }

  if (getUnscoredScoresheets(sortedMatches, tableId)) {
    return 'scoresheet';
  }

  if (loadedMatch) {
    return 'prestart';
  }

  return 'none';
}

const RefereeContext = createContext<RefereeContextType | null>(null);

interface RefereeProviderProps {
  data: RefereeFieldData;
  children?: ReactNode;
}

export function RefereeProvider({ data, children }: RefereeProviderProps) {
  const { roleInfo } = useUser();
  const tableId = String(roleInfo?.tableId);
  const { matches, matchLength, loadedMatch: loadedMatchId, activeMatch: activeMatchId } = data;

  const value = useMemo<RefereeContextType>(() => {
    const sortedMatches = sortMatchesByTime(matches);

    const active = activeMatchId
      ? sortedMatches.find(match => match.id === activeMatchId) || null
      : null;
    const activeMatch = active && hasTeamOnTable(active, tableId) ? active : null;

    const loaded = loadedMatchId
      ? sortedMatches.find(match => match.id === loadedMatchId) || null
      : null;
    const loadedMatch = loaded && hasTeamOnTable(loaded, tableId) ? loaded : null;

    const displayState = calculateDisplayState(sortedMatches, tableId, activeMatch, loadedMatch);

    const currentMatchIndex = activeMatch
      ? sortedMatches.findIndex(match => match.id === activeMatch.id)
      : loadedMatch
        ? sortedMatches.findIndex(match => match.id === loadedMatch.id)
        : -1;

    const upcomingMatches = sortedMatches
      .slice(currentMatchIndex + 1)
      .filter(match => match.status === 'not-started' && hasTeamOnTable(match, tableId))
      .slice(0, 3);

    return {
      loadedMatch,
      activeMatch,
      matchLength,
      tableId,
      displayState,
      upcomingMatches,
      sortedMatches
    };
  }, [matches, loadedMatchId, activeMatchId, matchLength, tableId]);

  return <RefereeContext.Provider value={value}>{children}</RefereeContext.Provider>;
}

export function useReferee() {
  const context = useContext(RefereeContext);
  if (!context) {
    throw new Error('useReferee must be used within RefereeProvider');
  }
  return context;
}
