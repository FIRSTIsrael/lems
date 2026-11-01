'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  ReactNode
} from 'react';
import useSWR from 'swr';
import dayjs, { Dayjs } from 'dayjs';
import { Box, CircularProgress } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { getDuration } from './calendar/calendar-utils';
import { BlocksByType } from './calendar/calendar-types';
import {
  ScheduleDraft,
  ScheduleDraftFingerprint,
  deleteScheduleDraft,
  loadScheduleDraft,
  saveScheduleDraft
} from './schedule-draft';

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

  /** Blocks restored from a saved draft, if one was found when the schedule was loaded */
  initialBlocks: BlocksByType | null;
  hasRestoredDraft: boolean;
  saveDraft: (blocks: BlocksByType) => void;
  /** Delete the saved draft and reset the schedule to its defaults */
  discardDraft: () => Promise<void>;
  /** Delete the saved draft without resetting the current state (e.g. after generating) */
  clearDraft: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export interface ScheduleProviderProps {
  children: ReactNode;
  eventId: string;
  divisionId: string;
}

interface ScheduleStateProviderProps {
  children: ReactNode;
  divisionId: string;
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;
  fingerprint: ScheduleDraftFingerprint;
  draft: ScheduleDraft | null;
  onDiscardDraft: () => Promise<void>;
}

const ScheduleStateProvider: React.FC<ScheduleStateProviderProps> = ({
  children,
  divisionId,
  teamsCount,
  roomsCount,
  tablesCount,
  fingerprint,
  draft,
  onDiscardDraft
}) => {
  const event = useEvent();
  const initial = draft?.settings;

  const allowStagger = tablesCount > 0 && tablesCount % 4 === 0;

  const [staggerMatches, setStaggerMatchesState] = useState(
    initial?.staggerMatches ?? allowStagger
  );
  const [practiceRounds, setPracticeRounds] = useState(
    initial?.practiceRounds ?? DEFAULT_PRACTICE_ROUNDS
  );
  const [rankingRounds, setRankingRounds] = useState(
    initial?.rankingRounds ?? DEFAULT_RANKING_ROUNDS
  );
  const [practiceCycleTime, setPracticeCycleTime] = useState<Dayjs>(
    initial?.practiceCycleTime ?? DEFAULT_PRACTICE_CYCLE_TIME
  );
  const [rankingCycleTime, setRankingCycleTime] = useState<Dayjs>(
    initial?.rankingCycleTime ?? DEFAULT_RANKING_CYCLE_TIME
  );
  const [judgingSessionCycleTime, setJudgingSessionCycleTime] = useState<Dayjs>(
    initial?.judgingSessionCycleTime ?? DEFAULT_JUDGING_SESSION_CYCLE_TIME
  );
  const [matchLength, setMatchLength] = useState<Dayjs>(
    initial?.matchLength ?? DEFAULT_MATCH_LENGTH
  );
  const [judgingSessionLength, setJudgingSessionLength] = useState<Dayjs>(
    initial?.judgingSessionLength ?? DEFAULT_JUDGING_SESSION_LENGTH
  );

  const [fieldStart, setFieldStart] = useState<Dayjs>(
    () => initial?.fieldStart ?? getFieldStart(event.startDate)
  );
  const [judgingStart, setJudgingStart] = useState<Dayjs>(
    () => initial?.judgingStart ?? getJudgingStart(event.startDate)
  );
  const timezone = event.timezone;

  const draftClearedRef = useRef(false);

  const saveDraft = useCallback(
    (blocks: BlocksByType) => {
      if (draftClearedRef.current) return;
      saveScheduleDraft(divisionId, fingerprint, {
        settings: {
          staggerMatches,
          practiceRounds,
          rankingRounds,
          practiceCycleTime,
          rankingCycleTime,
          judgingSessionCycleTime,
          matchLength,
          judgingSessionLength,
          fieldStart,
          judgingStart
        },
        blocks
      }).catch(error => console.error('Failed to save schedule draft', error));
    },
    [
      divisionId,
      fingerprint,
      staggerMatches,
      practiceRounds,
      rankingRounds,
      practiceCycleTime,
      rankingCycleTime,
      judgingSessionCycleTime,
      matchLength,
      judgingSessionLength,
      fieldStart,
      judgingStart
    ]
  );

  const clearDraft = useCallback(async () => {
    draftClearedRef.current = true;
    await deleteScheduleDraft(divisionId);
  }, [divisionId]);

  const discardDraft = useCallback(async () => {
    draftClearedRef.current = true;
    await onDiscardDraft();
  }, [onDiscardDraft]);

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
    setJudgingSessionCycleTime(DEFAULT_JUDGING_SESSION_CYCLE_TIME);
    setMatchLength(DEFAULT_MATCH_LENGTH);
    setJudgingSessionLength(DEFAULT_JUDGING_SESSION_LENGTH);
    setFieldStart(getFieldStart(event.startDate));
    setJudgingStart(getJudgingStart(event.startDate));
  };

  const contextValue: ScheduleContextType = {
    teamsCount,
    roomsCount,
    tablesCount,

    practiceRounds,
    rankingRounds,
    judgingSessions: Math.ceil(teamsCount / roomsCount),

    allowStagger,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime,
    matchLength,
    judgingSessionLength,
    matchesPerRound: Math.ceil((teamsCount / tablesCount) * (staggerMatches ? 2 : 1)),

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

    resetSettings,

    initialBlocks: draft?.blocks ?? null,
    hasRestoredDraft: !!draft,
    saveDraft,
    discardDraft,
    clearDraft
  };

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};

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

  const eventStartDate = dayjs(event.startDate).toISOString();
  const fingerprint = useMemo<ScheduleDraftFingerprint>(
    () => ({
      eventStartDate,
      teamsCount: teams.length,
      roomsCount: rooms.length,
      tablesCount: tables.length
    }),
    [eventStartDate, teams.length, rooms.length, tables.length]
  );

  const [draftState, setDraftState] = useState<{
    fingerprint: ScheduleDraftFingerprint;
    draft: ScheduleDraft | null;
  } | null>(null);
  // Bumped to remount the schedule state with defaults after discarding a draft
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadScheduleDraft(divisionId, fingerprint)
      .catch(error => {
        console.error('Failed to load schedule draft', error);
        return null;
      })
      .then(draft => {
        if (!cancelled) setDraftState({ fingerprint, draft });
      });
    return () => {
      cancelled = true;
    };
  }, [divisionId, fingerprint]);

  const onDiscardDraft = useCallback(async () => {
    await deleteScheduleDraft(divisionId).catch(error =>
      console.error('Failed to delete schedule draft', error)
    );
    setDraftState({ fingerprint, draft: null });
    setResetCount(prev => prev + 1);
  }, [divisionId, fingerprint]);

  if (!draftState || draftState.fingerprint !== fingerprint) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ScheduleStateProvider
      key={`${JSON.stringify(fingerprint)}-${resetCount}`}
      divisionId={divisionId}
      teamsCount={teams.length}
      roomsCount={rooms.length}
      tablesCount={tables.length}
      fingerprint={fingerprint}
      draft={draftState.draft}
      onDiscardDraft={onDiscardDraft}
    >
      {children}
    </ScheduleStateProvider>
  );
};

export const useSchedule = (): ScheduleContextType => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export default ScheduleProvider;
