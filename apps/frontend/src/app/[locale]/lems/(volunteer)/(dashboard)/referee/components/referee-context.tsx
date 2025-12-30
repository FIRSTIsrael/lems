'use client';

import { createContext, useContext, useMemo, ReactNode, useState } from 'react';
import { useTime } from '../../../../../../../lib/time/hooks';
import type { RefereeMatch, RefereeFieldData } from '../graphql/types';
import { useUser } from '../../../../components/user-context';

export type RefereeDisplayState = 'scoresheet' | 'timer' | 'prestart' | 'none';

interface ScoresheetRedirect {
  teamSlug: string;
  scoresheetSlug: string;
}

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
  displayState: RefereeDisplayState;
  scoresheetRedirect: ScoresheetRedirect | null;
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
    // Helper function to check if a match has a participant with a team on this table
    const matchHasTeamOnTable = (match: RefereeMatch): boolean => {
      const participant = match.participants.find(p => p.table.id === tableId);
      return !!participant?.team;
    };

    const active = activeMatchId
      ? sortedMatches.find(match => match.id === activeMatchId) || null
      : null;
    // Return null if the active match doesn't have a participant on this table
    const activeWithTeam = active && matchHasTeamOnTable(active) ? active : null;

    const loaded = loadedMatchId
      ? sortedMatches.find(match => match.id === loadedMatchId) || null
      : null;
    // Return null if the loaded match doesn't have a participant on this table
    const loadedWithTeam = loaded && matchHasTeamOnTable(loaded) ? loaded : null;

    const nextIndex = activeWithTeam
      ? sortedMatches.findIndex(match => match.id === activeWithTeam.id) + 1
      : loadedWithTeam
        ? sortedMatches.findIndex(match => match.id === loadedWithTeam.id) + 1
        : 0;

    const next = nextIndex < sortedMatches.length ? sortedMatches[nextIndex] : null;

    // Determine display state and scoresheet redirect
    let displayState: RefereeDisplayState = 'none';
    let scoresheetRedirect: ScoresheetRedirect | null = null;

    // Check for unsubmitted scoresheets from completed matches (highest priority)
    const completedMatchesWithPresence = sortedMatches
      .filter(match => match.status === 'completed')
      .filter(match => {
        const participant = match.participants.find(p => p.table.id === tableId);
        return participant?.present && participant?.team && participant.team.arrived;
      });

    for (const match of completedMatchesWithPresence) {
      const participant = match.participants.find(p => p.table.id === tableId && p.team);
      if (!participant?.team || !participant.team.arrived) continue;

      const scoresheet = participant.scoresheet;
      if (scoresheet && scoresheet.status !== 'submitted' && !scoresheet.escalated) {
        displayState = 'scoresheet';
        scoresheetRedirect = {
          teamSlug: participant.team.slug,
          scoresheetSlug: scoresheet.slug
        };
        break;
      }
    }

    // If no scoresheet redirect, determine other states
    if (displayState !== 'scoresheet') {
      if (activeWithTeam && activeWithTeam.status === 'in-progress') {
        displayState = 'timer';
      } else if (loadedWithTeam) {
        displayState = 'prestart';
      } else {
        displayState = 'none';
      }
    }

    return {
      matches: sortedMatches,
      activeMatch: activeWithTeam,
      loadedMatch: loadedWithTeam,
      nextMatch: next,
      matchLength,
      tableId,
      inspectionStartTime,
      setInspectionStartTime,
      inspectionTimeRemaining,
      displayState,
      scoresheetRedirect
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
