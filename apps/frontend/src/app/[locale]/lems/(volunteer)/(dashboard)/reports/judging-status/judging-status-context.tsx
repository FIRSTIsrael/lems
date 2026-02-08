'use client';

import dayjs, { Dayjs } from 'dayjs';
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useTime } from '../../../../../../../lib/time/hooks';
import type { QueryData, JudgingSession, Room } from './graphql/types';

export interface JudgingStatusContextType {
  sessions: JudgingSession[];
  nextSessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
  loading: boolean;
  countdownTargetTime: Dayjs | null;
}

function parseJudgingStatus(
  queryData: QueryData,
  now: Dayjs
): Omit<JudgingStatusContextType, 'loading'> {
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

  // Advance to the next round if sessionLength minutes have passed since first in-progress session
  for (let i = 0; i < sortedSessionNumbers.length; i++) {
    const sessionNumber = sortedSessionNumbers[i];
    const roundSessions = sessionsByNumber.get(sessionNumber)!;

    const arrivedSessions = roundSessions.filter(s => s.team?.arrived);

    if (arrivedSessions.length > 0) {
      // Find the earliest start time among in-progress
      const startedSessions = arrivedSessions.filter(s => s.status === 'in-progress');

      if (startedSessions.length > 0) {
        // Find the earliest start time in this round
        const earliestStartTime = startedSessions.reduce(
          (earliest, session) => {
            if (!session.startTime) return earliest;
            const startTime = dayjs(session.startTime);
            return !earliest || startTime.isBefore(earliest) ? startTime : earliest;
          },
          null as dayjs.Dayjs | null
        );

        if (earliestStartTime) {
          const secondsSinceStart = now.diff(earliestStartTime, 'second');
          const ADVANCEMENT_TIME_SECONDS = 15 * 60; // 15 minutes

          // If 15 minutes have passed since first session started, move to next round
          if (secondsSinceStart >= ADVANCEMENT_TIME_SECONDS) {
            currentRoundNumber = sessionNumber;
            continue;
          } else {
            // Still within the 15-minute window, this is the current round
            currentRoundNumber = sessionNumber;
            break;
          }
        }
      }

      // If no sessions have started yet, check if all are completed
      const allCompleted = arrivedSessions.every(s => s.status === 'completed');
      if (allCompleted) {
        currentRoundNumber = sessionNumber;
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
  const now = useTime({ interval: 1000 });

  const value = useMemo(() => {
    const parsed = parseJudgingStatus(data, now);
    return {
      ...parsed,
      loading
    };
  }, [data, loading, now]);

  return <JudgingStatusContext.Provider value={value}>{children}</JudgingStatusContext.Provider>;
}

export function useJudgingStatus() {
  const context = useContext(JudgingStatusContext);
  if (!context) {
    throw new Error('useJudgingStatus must be used within JudgingStatusProvider');
  }
  return context;
}
