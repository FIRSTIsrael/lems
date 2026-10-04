'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';

interface Team {
  id: string;
  number: number;
  name: string;
  affiliation?: string;
}

interface PracticeTableAssignment {
  id: string;
  divisionId: string;
  team: Team;
  tableIndex: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
}

interface BlockedTimeSlot {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  reason?: string;
}

interface PracticeTablesConfig {
  divisionId: string;
  tableCount: number;
  slotDurationMinutes: number;
  startTime: string; // ISO 8601 datetime
  endTime: string; // ISO 8601 datetime
  blockedTimeSlots: BlockedTimeSlot[];
}

interface PracticeTablesManagerContextType {
  divisionId: string;
  eventId: string;
  eventStartDate: string | null;
  config: PracticeTablesConfig | null;
  teams: Team[];
  assignments: PracticeTableAssignment[];
  assignmentsMap: Record<string, Record<string, Team>>; // tableIndex -> time -> Team
  loading: boolean;
}

const PracticeTablesManagerContext = createContext<PracticeTablesManagerContextType | null>(null);

interface PracticeTablesManagerProviderProps {
  divisionId: string;
  eventId: string;
  eventStartDate: string | null;
  config: PracticeTablesConfig | null;
  teams: Team[];
  assignments: PracticeTableAssignment[];
  loading: boolean;
  children?: ReactNode;
}

export function PracticeTablesManagerProvider({
  divisionId,
  eventId,
  eventStartDate,
  config,
  teams,
  assignments,
  loading,
  children
}: PracticeTablesManagerProviderProps) {
  // Build assignments map for quick lookup
  const assignmentsMap = useMemo(() => {
    const map: Record<string, Record<string, Team>> = {};

    assignments.forEach(assignment => {
      const tableIndex = assignment.tableIndex.toString();
      if (!map[tableIndex]) {
        map[tableIndex] = {};
      }

      map[tableIndex][assignment.startTime] = assignment.team;
    });

    return map;
  }, [assignments]);

  const value = useMemo(
    () => ({
      divisionId,
      eventId,
      eventStartDate,
      config,
      teams,
      assignments,
      assignmentsMap,
      loading
    }),
    [divisionId, eventId, eventStartDate, config, teams, assignments, assignmentsMap, loading]
  );

  return (
    <PracticeTablesManagerContext.Provider value={value}>
      {children}
    </PracticeTablesManagerContext.Provider>
  );
}

export function usePracticeTablesManager() {
  const context = useContext(PracticeTablesManagerContext);
  if (!context) {
    throw new Error(
      'usePracticeTablesManager must be used within a PracticeTablesManagerProvider'
    );
  }
  return context;
}
