'use client';

import dayjs, { Dayjs } from 'dayjs';
import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { QueryData, JudgingSession, Room } from './graphql/types';

export interface JudgingStatusContextType {
  sessions: JudgingSession[];
  nextSessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
  loading: boolean;
  countdownTargetTime: Dayjs | null;
}

function parseJudgingStatus(queryData: QueryData): Omit<JudgingStatusContextType, 'loading'> {
  const sessions = queryData?.division?.judging.sessions ?? [];
  const rooms = queryData?.division?.rooms ?? [];
  const sessionLength = queryData?.division?.judging.sessionLength ?? 0;

  const sessionsByNumber = new Map<number, typeof sessions>();
  sessions.forEach(session => {
    if (!sessionsByNumber.has(session.number)) {
      sessionsByNumber.set(session.number, []);
    }
    sessionsByNumber.get(session.number)!.push(session);
  });

  const sortedSessionNumbers = Array.from(sessionsByNumber.keys()).sort((a, b) => a - b);

  if (sortedSessionNumbers.length === 0) {
    return {
      sessions: [],
      nextSessions: [],
      rooms,
      sessionLength,
      countdownTargetTime: null
    };
  }

  let currentRoundNumber = sortedSessionNumbers[0];

  // Start at session 1, then increment if every session in the round
  // with a team that arrived is completed
  for (const sessionNumber of sortedSessionNumbers) {
    const roundSessions = sessionsByNumber.get(sessionNumber)!;

    const arrivedSessions = roundSessions.filter(s => s.team?.arrived);

    if (arrivedSessions.length > 0) {
      const allArrivedInProgressOrCompleted = arrivedSessions.every(s => s.status === 'completed');

      if (allArrivedInProgressOrCompleted) {
        currentRoundNumber = sessionNumber;
      } else {
        break;
      }
    }
  }

  const currentSessions = sessionsByNumber.get(currentRoundNumber) ?? [];
  const nextIndex = sortedSessionNumbers.indexOf(currentRoundNumber) + 1;
  const nextRoundNumber =
    nextIndex < sortedSessionNumbers.length ? sortedSessionNumbers[nextIndex] : currentRoundNumber;
  const nextSessions =
    nextRoundNumber !== currentRoundNumber ? (sessionsByNumber.get(nextRoundNumber) ?? []) : [];

  // Determine countdown target time:
  // - If all current sessions are 'in-progress', target the next round's start time
  // - Otherwise, target the current session's start time
  let countdownTargetTime: Dayjs | null = null;
  if (currentSessions.length > 0) {
    const allCurrentInProgress = currentSessions.every(s => s.status === 'in-progress');
    if (allCurrentInProgress && nextSessions.length > 0) {
      countdownTargetTime = dayjs(nextSessions[0].scheduledTime);
    } else {
      countdownTargetTime = dayjs(currentSessions[0].scheduledTime);
    }
  }

  return {
    sessions: currentSessions,
    nextSessions,
    rooms,
    sessionLength,
    countdownTargetTime
  };
}

const JudgingStatusContext = createContext<JudgingStatusContextType | null>(null);

interface JudgingStatusProviderProps {
  children: ReactNode;
  data: QueryData;
  loading?: boolean;
}

export function JudgingStatusProvider({
  children,
  data,
  loading = false
}: JudgingStatusProviderProps) {
  const value = useMemo(() => {
    const parsed = parseJudgingStatus(data);
    return {
      ...parsed,
      loading
    };
  }, [data, loading]);

  return <JudgingStatusContext.Provider value={value}>{children}</JudgingStatusContext.Provider>;
}

export function useJudgingStatus() {
  const context = useContext(JudgingStatusContext);
  if (!context) {
    throw new Error('useJudgingStatus must be used within JudgingStatusProvider');
  }
  return context;
}
