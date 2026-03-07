'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import type { FieldQueuerData } from '../graphql/types';

export interface CalledTeam {
  teamNumber: number;
  teamName: string;
  tableName: string;
  matchNumber: number;
  scheduledTime: string;
  isInJudging: boolean;
  isUrgent: boolean;
  isQueued: boolean;
  isPresent: boolean;
  isReady: boolean;
  teamId: string;
  tableId: string;
}

interface FieldQueuerContextType {
  divisionId: string;
  data: FieldQueuerData;
  loading: boolean;
  tables: string[];
  calledTeams: CalledTeam[];
  currentTime: Dayjs;
}

const FieldQueuerContext = createContext<FieldQueuerContextType | null>(null);

interface FieldQueuerProviderProps {
  divisionId: string;
  data: FieldQueuerData;
  loading: boolean;
  currentTime: Dayjs;
  children?: ReactNode;
}

export function FieldQueuerProvider({
  divisionId,
  data,
  loading,
  currentTime,
  children
}: FieldQueuerProviderProps) {
  const tables = useMemo(() => {
    const tableSet = new Set<string>();
    data.matches.forEach(match => {
      match.participants.forEach(p => {
        if (p.table) tableSet.add(p.table.name);
      });
    });
    return Array.from(tableSet).sort();
  }, [data.matches]);

  const calledTeams = useMemo(() => {
    const teams: CalledTeam[] = [];

    const calledMatches = data.matches.filter(m => m.called && m.status === 'not-started');

    const activeSessions = data.sessions.filter(
      s => s.status === 'in-progress' || (s.status === 'not-started' && s.called)
    );

    calledMatches.forEach(match => {
      match.participants
        .filter(p => p.team && !p.queued && p.team.arrived)
        .forEach(participant => {
          if (!participant.team || !participant.table) return;

          const isInJudging = activeSessions.some(s => s.team?.id === participant.team?.id);
          const minutesUntilMatch = currentTime.diff(dayjs(match.scheduledTime), 'minute');
          const isUrgent = minutesUntilMatch >= -10;

          teams.push({
            teamNumber: participant.team.number,
            teamName: participant.team.name,
            tableName: participant.table.name,
            matchNumber: match.number,
            scheduledTime: match.scheduledTime,
            isInJudging,
            isUrgent,
            isQueued: participant.queued,
            isPresent: participant.present,
            isReady: participant.ready,
            teamId: participant.team.id,
            tableId: participant.table.id
          });
        });
    });

    teams.sort((a, b) => {
      if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
      if (a.isInJudging !== b.isInJudging) return a.isInJudging ? 1 : -1;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return teams;
  }, [data.matches, data.sessions, currentTime]);

  const value = useMemo<FieldQueuerContextType>(
    () => ({
      divisionId,
      data,
      loading,
      tables,
      calledTeams,
      currentTime
    }),
    [divisionId, data, loading, tables, calledTeams, currentTime]
  );

  return <FieldQueuerContext.Provider value={value}>{children}</FieldQueuerContext.Provider>;
}

export function useFieldQueuer() {
  const context = useContext(FieldQueuerContext);
  if (!context) {
    throw new Error('useFieldQueuer must be used within FieldQueuerProvider');
  }
  return context;
}
