'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';

const DEFAULT_STAGGER_MATCHES = true;
const DEFAULT_PRACTICE_CYCLE_TIME = dayjs().hour(0).minute(6).second(0);
const DEFAULT_RANKING_CYCLE_TIME = dayjs().hour(0).minute(5).second(0);
const DEFAULT_JUDGING_SESSION_CYCLE_TIME = dayjs().hour(0).minute(45).second(0);
const DEFAULT_MATCH_LENGTH = dayjs().hour(0).minute(2).second(30);
const DEFAULT_JUDGING_SESSION_LENGTH = dayjs().hour(0).minute(30).second(0);

export interface ScheduleContextType {
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;

  staggerMatches: boolean;
  practiceCycleTime: Dayjs;
  rankingCycleTime: Dayjs;
  judgingSessionCycleTime: Dayjs;
  matchLength: Dayjs;
  judgingSessionLength: Dayjs;

  setStaggerMatches: (value: boolean) => void;
  setPracticeCycleTime: (value: Dayjs | null) => void;
  setRankingCycleTime: (value: Dayjs | null) => void;
  setJudgingSessionCycleTime: (value: Dayjs | null) => void;
  setMatchLength: (value: Dayjs | null) => void;
  setJudgingSessionLength: (value: Dayjs | null) => void;

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

  const [staggerMatches, setStaggerMatches] = useState(DEFAULT_STAGGER_MATCHES);
  const [practiceCycleTime, setPracticeCycleTimeState] = useState<Dayjs>(
    DEFAULT_PRACTICE_CYCLE_TIME
  );
  const [rankingCycleTime, setRankingCycleTimeState] = useState<Dayjs>(DEFAULT_RANKING_CYCLE_TIME);
  const [judgingSessionCycleTime, setJudgingSessionCycleTimeState] = useState<Dayjs>(
    DEFAULT_JUDGING_SESSION_CYCLE_TIME
  );
  const [matchLength, setMatchLengthState] = useState<Dayjs>(DEFAULT_MATCH_LENGTH);
  const [judgingSessionLength, setJudgingSessionLengthState] = useState<Dayjs>(
    DEFAULT_JUDGING_SESSION_LENGTH
  );

  const setPracticeCycleTime = (value: Dayjs | null) => {
    if (value) setPracticeCycleTimeState(value);
  };

  const setRankingCycleTime = (value: Dayjs | null) => {
    if (value) setRankingCycleTimeState(value);
  };

  const setJudgingSessionCycleTime = (value: Dayjs | null) => {
    if (value) setJudgingSessionCycleTimeState(value);
  };

  const setMatchLength = (value: Dayjs | null) => {
    if (value) setMatchLengthState(value);
  };

  const setJudgingSessionLength = (value: Dayjs | null) => {
    if (value) setJudgingSessionLengthState(value);
  };

  const resetSettings = () => {
    setStaggerMatches(DEFAULT_STAGGER_MATCHES);
    setPracticeCycleTimeState(DEFAULT_PRACTICE_CYCLE_TIME);
    setRankingCycleTimeState(DEFAULT_RANKING_CYCLE_TIME);
    setJudgingSessionCycleTimeState(DEFAULT_JUDGING_SESSION_CYCLE_TIME);
    setMatchLengthState(DEFAULT_MATCH_LENGTH);
    setJudgingSessionLengthState(DEFAULT_JUDGING_SESSION_LENGTH);
  };

  const contextValue: ScheduleContextType = {
    teamsCount: teams.length,
    roomsCount: rooms.length,
    tablesCount: tables.length,

    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime,
    matchLength,
    judgingSessionLength,

    setStaggerMatches,
    setPracticeCycleTime,
    setRankingCycleTime,
    setJudgingSessionCycleTime,
    setMatchLength,
    setJudgingSessionLength,
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
