'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';
import type { Edition } from '@lems/shared/edition';
import { JUDGING_DEFAULTS } from '@lems/shared/judging';
import { useEvent } from '../../components/event-context';
import { getDuration } from './calendar/calendar-utils';

const DEFAULT_MATCH_LENGTH = dayjs().hour(0).minute(2).second(30);
const getFieldStart = (date: Date) => dayjs(date).hour(8).minute(0).second(0);

const DEFAULT_PRACTICE_ROUNDS = 1;
const DEFAULT_PRACTICE_CYCLE_TIME = dayjs().hour(0).minute(6).second(0);

const DEFAULT_RANKING_ROUNDS = 3;
const DEFAULT_RANKING_CYCLE_TIME = dayjs().hour(0).minute(5).second(0);

const secondsToTime = (seconds: number) =>
  dayjs().hour(0).minute(Math.floor(seconds / 60)).second(seconds % 60);

const getJudgingStart = (date: Date) => dayjs(date).hour(8).minute(0).second(0);

const multiplyCycleTime = (cycleTime: Dayjs, multiplier: number) => {
  let newTime = cycleTime.clone();
  newTime = newTime.set('hour', 0).set('minute', 0).set('second', 0);

  const durationSeconds = getDuration(cycleTime) * multiplier;
  newTime = newTime.add(durationSeconds, 'second');

  return newTime;
};

export interface ScheduleContextType {
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;

  practiceRounds: number;
  rankingRounds: number;
  judgingSessions: number;

  allowStagger: boolean;
  staggerMatches: boolean;
  matchesPerRound: number;
  practiceCycleTime: Dayjs;
  rankingCycleTime: Dayjs;
  judgingSessionCycleTime: Dayjs;
  matchLength: Dayjs;
  judgingSessionLength: Dayjs;

  judgingStart: Dayjs;
  fieldStart: Dayjs;
  timezone: string;

  setStaggerMatches: (value: boolean) => void;
  setPracticeCycleTime: (value: Dayjs) => void;
  setRankingCycleTime: (value: Dayjs) => void;
  setJudgingSessionCycleTime: (value: Dayjs) => void;
  setMatchLength: (value: Dayjs) => void;
  setJudgingSessionLength: (value: Dayjs) => void;
  setJudgingStart: React.Dispatch<React.SetStateAction<Dayjs>>;
  setFieldStart: React.Dispatch<React.SetStateAction<Dayjs>>;
  setPracticeRounds: React.Dispatch<React.SetStateAction<number>>;
  setRankingRounds: React.Dispatch<React.SetStateAction<number>>;

  resetSettings: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export interface ScheduleProviderProps {
  children: ReactNode;
  eventId: string;
  divisionId: string;
  edition: Edition;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  eventId,
  divisionId,
  edition
}) => {
  const event = useEvent();
  const judgingDefaults = JUDGING_DEFAULTS[edition];

  const { data: teams = [] } = useSWR<unknown[]>(
    `/admin/events/${eventId}/divisions/${divisionId}/teams`,
    { suspense: true }
  );

  const { data: rooms = [] } = useSWR<unknown[]>(
    `/admin/events/${eventId}/divisions/${divisionId}/rooms`,
    { suspense: true }
  );

  const { data: tables = [] } = useSWR<unknown[]>(
    `/admin/events/${eventId}/divisions/${divisionId}/tables`,
    { suspense: true }
  );

  const allowStagger = tables.length > 0 && tables.length % 4 === 0;

  const [staggerMatches, setStaggerMatchesState] = useState(allowStagger);
  const [practiceRounds, setPracticeRounds] = useState(DEFAULT_PRACTICE_ROUNDS);
  const [rankingRounds, setRankingRounds] = useState(DEFAULT_RANKING_ROUNDS);
  const [practiceCycleTime, setPracticeCycleTime] = useState<Dayjs>(DEFAULT_PRACTICE_CYCLE_TIME);
  const [rankingCycleTime, setRankingCycleTime] = useState<Dayjs>(DEFAULT_RANKING_CYCLE_TIME);
  const [judgingSessionCycleTime, setJudgingSessionCycleTime] = useState<Dayjs>(
    secondsToTime(judgingDefaults.cycleTimeSeconds)
  );
  const [matchLength, setMatchLength] = useState<Dayjs>(DEFAULT_MATCH_LENGTH);
  const [judgingSessionLength, setJudgingSessionLength] = useState<Dayjs>(
    secondsToTime(judgingDefaults.sessionLengthSeconds)
  );

  const [fieldStart, setFieldStart] = useState<Dayjs>(getFieldStart(event.startDate));
  const [judgingStart, setJudgingStart] = useState<Dayjs>(getJudgingStart(event.startDate));
  const timezone = event.timezone;

  useEffect(() => {
    if (!allowStagger && staggerMatches) {
      setStaggerMatches(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowStagger]);

  const setStaggerMatches = (value: boolean) => {
    if (value === staggerMatches) return;

    if (staggerMatches) {
      setPracticeCycleTime(prev => multiplyCycleTime(prev, 2));
      setRankingCycleTime(prev => multiplyCycleTime(prev, 2));
      setStaggerMatchesState(false);
    } else {
      setPracticeCycleTime(prev => multiplyCycleTime(prev, 0.5));
      setRankingCycleTime(prev => multiplyCycleTime(prev, 0.5));
      setStaggerMatchesState(true);
    }
  };

  const resetSettings = () => {
    setStaggerMatchesState(allowStagger);
    setPracticeRounds(DEFAULT_PRACTICE_ROUNDS);
    setRankingRounds(DEFAULT_RANKING_ROUNDS);
    setPracticeCycleTime(DEFAULT_PRACTICE_CYCLE_TIME);
    setRankingCycleTime(DEFAULT_RANKING_CYCLE_TIME);
    setJudgingSessionCycleTime(secondsToTime(judgingDefaults.cycleTimeSeconds));
    setMatchLength(DEFAULT_MATCH_LENGTH);
    setJudgingSessionLength(secondsToTime(judgingDefaults.sessionLengthSeconds));
    setFieldStart(getFieldStart(event.startDate));
    setJudgingStart(getJudgingStart(event.startDate));
  };

  const contextValue: ScheduleContextType = {
    teamsCount: teams.length,
    roomsCount: rooms.length,
    tablesCount: tables.length,

    practiceRounds,
    rankingRounds,
    judgingSessions: Math.ceil(teams.length / rooms.length),

    allowStagger,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime,
    matchLength,
    judgingSessionLength,
    matchesPerRound: Math.ceil((teams.length / tables.length) * (staggerMatches ? 2 : 1)),

    judgingStart,
    fieldStart,
    timezone,

    setFieldStart,
    setMatchLength,
    setStaggerMatches,
    setPracticeCycleTime,
    setRankingCycleTime,
    setPracticeRounds,
    setRankingRounds,

    setJudgingStart,
    setJudgingSessionLength,
    setJudgingSessionCycleTime,

    resetSettings
  };

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export default ScheduleProvider;
