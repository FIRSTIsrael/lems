'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import dayjs from 'dayjs';
import type { Division, Field, Match, Table } from '../graphql';

interface FieldStatusContextType {
  division: Division;
  field: Field;
  tables: Table[];
  matches: Match[];
  activeMatch: Match | null;
  loadedMatch: Match | null;
  queuedMatches: Match[];
  upcomingMatches: Match[];
  matchLength: number;
}

const FieldStatusContext = createContext<FieldStatusContextType | null>(null);

interface FieldStatusProviderProps {
  data: {
    division: Division;
    field: Field;
    tables: Table[];
  };
  children?: ReactNode;
}

export function FieldStatusProvider({ data, children }: FieldStatusProviderProps) {
  const { division, field, tables } = data;
  const matches = field.matches;

  const value = useMemo<FieldStatusContextType>(() => {
    const activeMatch = field.activeMatch
      ? matches.find(m => m.id === field.activeMatch) || null
      : null;

    const loadedMatch = field.loadedMatch
      ? matches.find(m => m.id === field.loadedMatch) || null
      : null;

    const queuedMatches = matches.filter(m => m.called && m.status === 'not-started');

    const now = dayjs();
    const currentStage = field.currentStage;

    const notStartedMatches = matches
      .filter(m => m.status === 'not-started')
      .sort((a, b) => dayjs(a.scheduledTime).diff(dayjs(b.scheduledTime)));

    const futureStageMatches = notStartedMatches.filter(
      m => dayjs(m.scheduledTime).isAfter(now) && m.stage === currentStage
    );
    const stageMatches = notStartedMatches.filter(m => m.stage === currentStage);

    const upcomingMatches = (
      futureStageMatches.length > 0
        ? futureStageMatches
        : stageMatches.length > 0
          ? stageMatches
          : notStartedMatches
    ).slice(0, 10);

    return {
      division,
      field,
      tables,
      matches,
      activeMatch,
      loadedMatch,
      queuedMatches,
      upcomingMatches,
      matchLength: field.matchLength
    };
  }, [division, field, tables, matches]);

  return <FieldStatusContext.Provider value={value}>{children}</FieldStatusContext.Provider>;
}

export function useFieldStatusData(): FieldStatusContextType {
  const context = useContext(FieldStatusContext);
  if (!context) {
    throw new Error('useFieldStatusData must be used within a FieldStatusProvider');
  }
  return context;
}
