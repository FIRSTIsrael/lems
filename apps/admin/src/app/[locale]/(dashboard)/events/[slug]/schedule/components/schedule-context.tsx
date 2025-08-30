'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';
import { useEvent } from '../../components/event-context';

const DEFAULT_STAGGER_MATCHES = true;
const DEFAULT_MATCH_LENGTH = dayjs().hour(0).minute(2).second(30);
const getFieldStart = (date: Date) => dayjs(date).hour(8).minute(0).second(0);

const DEFAULT_PRACTICE_ROUNDS = 1;
const DEFAULT_PRACTICE_CYCLE_TIME = dayjs().hour(0).minute(6).second(0);

const DEFAULT_RANKING_ROUNDS = 3;
const DEFAULT_RANKING_CYCLE_TIME = dayjs().hour(0).minute(5).second(0);

const DEFAULT_JUDGING_SESSION_LENGTH = dayjs().hour(0).minute(30).second(0);
const DEFAULT_JUDGING_SESSION_CYCLE_TIME = dayjs().hour(0).minute(45).second(0);
const getJudgingStart = (date: Date) => dayjs(date).hour(8).minute(0).second(0);

const multiplyCycleTime = (cycleTime: Dayjs, multiplier: number) => {
  const newTime = cycleTime.clone();
  newTime.set('hour', 0).set('minute', 0).set('second', 0);

  const durationSeconds =
    (cycleTime.hour() * 3600 + cycleTime.minute() * 60 + cycleTime.second()) * multiplier;

  newTime.add(durationSeconds, 'second');
  return newTime;
};

export interface ScheduleContextType {
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;

  practiceRounds: number;
  rankingRounds: number;
  judgingSessions: number;

  staggerMatches: boolean;
  matchesPerRound: number;
  practiceCycleTime: Dayjs;
  rankingCycleTime: Dayjs;
  judgingSessionCycleTime: Dayjs;
  matchLength: Dayjs;
  judgingSessionLength: Dayjs;

  judgingStart: Dayjs;
  fieldStart: Dayjs;

  setStaggerMatches: (value: boolean) => void;
  setPracticeCycleTime: (value: Dayjs) => void;
  setRankingCycleTime: (value: Dayjs) => void;
  setJudgingSessionCycleTime: (value: Dayjs) => void;
  setMatchLength: (value: Dayjs) => void;
  setJudgingSessionLength: (value: Dayjs) => void;
  setJudgingStart: React.Dispatch<React.SetStateAction<Dayjs>>;
  setFieldStart: React.Dispatch<React.SetStateAction<Dayjs>>;

  addPracticeRound: () => void;
  removePracticeRound: () => void;
  addRankingRound: () => void;
  removeRankingRound: () => void;

  resetSettings: () => void;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export interface ScheduleProviderProps {
  children: ReactNode;
  eventId: string;
  divisionId: string;
}

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  eventId,
  divisionId
}) => {
  const event = useEvent();

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

  const [staggerMatches, setStaggerMatchesState] = useState(DEFAULT_STAGGER_MATCHES);
  const [practiceRounds, setPracticeRounds] = useState(DEFAULT_PRACTICE_ROUNDS);
  const [rankingRounds, setRankingRounds] = useState(DEFAULT_RANKING_ROUNDS);
  const [practiceCycleTime, setPracticeCycleTime] = useState<Dayjs>(DEFAULT_PRACTICE_CYCLE_TIME);
  const [rankingCycleTime, setRankingCycleTime] = useState<Dayjs>(DEFAULT_RANKING_CYCLE_TIME);
  const [judgingSessionCycleTime, setJudgingSessionCycleTime] = useState<Dayjs>(
    DEFAULT_JUDGING_SESSION_CYCLE_TIME
  );
  const [matchLength, setMatchLength] = useState<Dayjs>(DEFAULT_MATCH_LENGTH);
  const [judgingSessionLength, setJudgingSessionLength] = useState<Dayjs>(
    DEFAULT_JUDGING_SESSION_LENGTH
  );

  const [fieldStart, setFieldStart] = useState<Dayjs>(getFieldStart(event.startDate));
  const [judgingStart, setJudgingStart] = useState<Dayjs>(getJudgingStart(event.startDate));

  const setStaggerMatches = (value: boolean) => {
    if (value === staggerMatches) return;

    if (staggerMatches) {
      multiplyCycleTime(practiceCycleTime, 2);
      multiplyCycleTime(rankingCycleTime, 2);
      setStaggerMatchesState(false);
    } else {
      multiplyCycleTime(practiceCycleTime, 0.5);
      multiplyCycleTime(rankingCycleTime, 0.5);
      setStaggerMatchesState(true);
    }
  };

  const addPracticeRound = () => {
    setPracticeRounds(prev => prev + 1);
  };

  const removePracticeRound = () => {
    setPracticeRounds(prev => Math.max(prev - 1, 0));
  };

  const addRankingRound = () => {
    setRankingRounds(prev => prev + 1);
  };

  const removeRankingRound = () => {
    setRankingRounds(prev => Math.max(prev - 1, 0));
  };

  const resetSettings = () => {
    setStaggerMatches(DEFAULT_STAGGER_MATCHES);
    setPracticeRounds(DEFAULT_PRACTICE_ROUNDS);
    setRankingRounds(DEFAULT_RANKING_ROUNDS);
    setPracticeCycleTime(DEFAULT_PRACTICE_CYCLE_TIME);
    setRankingCycleTime(DEFAULT_RANKING_CYCLE_TIME);
    setJudgingSessionCycleTime(DEFAULT_JUDGING_SESSION_CYCLE_TIME);
    setMatchLength(DEFAULT_MATCH_LENGTH);
    setJudgingSessionLength(DEFAULT_JUDGING_SESSION_LENGTH);
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

    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime,
    matchLength,
    judgingSessionLength,
    matchesPerRound: Math.ceil(teams.length / tables.length) * (staggerMatches ? 2 : 1),

    judgingStart,
    fieldStart,

    setStaggerMatches,
    setPracticeCycleTime,
    setRankingCycleTime,
    setJudgingSessionCycleTime,
    setMatchLength,
    setJudgingSessionLength,
    addPracticeRound,
    removePracticeRound,
    addRankingRound,
    removeRankingRound,
    setJudgingStart,
    setFieldStart,
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
