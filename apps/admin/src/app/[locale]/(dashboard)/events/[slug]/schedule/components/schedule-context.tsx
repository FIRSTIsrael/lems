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
import type { Edition } from '@lems/shared/edition';
import { groupTablesByPair } from '@lems/shared/utils';
import type { RobotGameTable } from '@lems/types/api/admin';
import { JUDGING_DEFAULTS, getMinimumJudgingSessionLength } from '@lems/shared/judging';
import { useEvent } from '../../components/event-context';
import { getDuration } from './calendar/calendar-utils';
import { BlocksByType } from './calendar/calendar-types';
import {
  ScheduleDraft,
  ScheduleDraftFingerprint,
  ScheduleDraftSettings,
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

const secondsToTime = (seconds: number) =>
  dayjs()
    .hour(0)
    .minute(Math.floor(seconds / 60))
    .second(seconds % 60);

const getJudgingStart = (date: Date) => dayjs(date).hour(8).minute(0).second(0);

const multiplyCycleTime = (cycleTime: Dayjs, multiplier: number) => {
  let newTime = cycleTime.clone();
  newTime = newTime.set('hour', 0).set('minute', 0).set('second', 0);

  const durationSeconds = getDuration(cycleTime) * multiplier;
  newTime = newTime.add(durationSeconds, 'second');

  return newTime;
};

export interface ScheduleContextType {
  edition: Edition;
  teamsCount: number;
  roomsCount: number;
  tablesCount: number;
  pairsCount: number;

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
  /** Shortest judging session that fits the edition's fixed judging stages. */
  minJudgingSessionLength: Dayjs;

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
  saveDraft: (blocks: BlocksByType) => void;
  /** Record the state on load as the baseline, so only changes from it are saved as a draft */
  captureDraftBaseline: (blocks: BlocksByType) => void;
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
  edition: Edition;
}

interface ScheduleStateProviderProps {
  children: ReactNode;
  divisionId: string;
  edition: Edition;
  fingerprint: ScheduleDraftFingerprint;
  draft: ScheduleDraft | null;
  /** Remount the schedule state with its defaults */
  onReset: () => void;
}

const ScheduleStateProvider: React.FC<ScheduleStateProviderProps> = ({
  children,
  divisionId,
  edition,
  fingerprint,
  draft,
  onReset
}) => {
  const event = useEvent();
  const judgingDefaults = JUDGING_DEFAULTS[edition];
  const { teamsCount, roomsCount, tablesCount, pairsCount } = fingerprint;

  const allowStagger = tablesCount > 0 && tablesCount % 4 === 0;

  const initial: ScheduleDraftSettings = draft?.settings ?? {
    staggerMatches: allowStagger,
    practiceRounds: DEFAULT_PRACTICE_ROUNDS,
    rankingRounds: DEFAULT_RANKING_ROUNDS,
    practiceCycleTime: DEFAULT_PRACTICE_CYCLE_TIME,
    rankingCycleTime: DEFAULT_RANKING_CYCLE_TIME,
    judgingSessionCycleTime: secondsToTime(judgingDefaults.cycleTimeSeconds),
    matchLength: DEFAULT_MATCH_LENGTH,
    judgingSessionLength: secondsToTime(judgingDefaults.sessionLengthSeconds),
    fieldStart: getFieldStart(event.startDate),
    judgingStart: getJudgingStart(event.startDate)
  };

  const [staggerMatches, setStaggerMatchesState] = useState(initial.staggerMatches);
  const [practiceRounds, setPracticeRounds] = useState(initial.practiceRounds);
  const [rankingRounds, setRankingRounds] = useState(initial.rankingRounds);
  const [practiceCycleTime, setPracticeCycleTime] = useState<Dayjs>(initial.practiceCycleTime);
  const [rankingCycleTime, setRankingCycleTime] = useState<Dayjs>(initial.rankingCycleTime);
  const [judgingSessionCycleTime, setJudgingSessionCycleTime] = useState<Dayjs>(
    initial.judgingSessionCycleTime
  );
  const [matchLength, setMatchLength] = useState<Dayjs>(initial.matchLength);
  const [judgingSessionLength, setJudgingSessionLength] = useState<Dayjs>(
    initial.judgingSessionLength
  );

  const [fieldStart, setFieldStart] = useState<Dayjs>(initial.fieldStart);
  const [judgingStart, setJudgingStart] = useState<Dayjs>(initial.judgingStart);
  const timezone = event.timezone;

  const settings = useMemo<ScheduleDraftSettings>(
    () => ({
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
    }),
    [
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

  const draftClearedRef = useRef(false);
  const baselineRef = useRef<{ settings: ScheduleDraftSettings; blocks: BlocksByType } | null>(
    null
  );

  const captureDraftBaseline = useCallback(
    (blocks: BlocksByType) => {
      baselineRef.current = { settings, blocks };
    },
    [settings]
  );

  const saveDraft = useCallback(
    (blocks: BlocksByType) => {
      if (draftClearedRef.current) return;

      // Don't save until something changed from the state on load, so an untouched schedule isn't saved as a draft.
      // State is immutable, so a reference check is enough to detect changes.
      const baseline = baselineRef.current;
      if (baseline && baseline.settings === settings && baseline.blocks === blocks) return;

      saveScheduleDraft(divisionId, fingerprint, { settings, blocks }).catch(error =>
        console.error('Failed to save schedule draft', error)
      );
    },
    [divisionId, fingerprint, settings]
  );

  const clearDraft = useCallback(async () => {
    draftClearedRef.current = true;
    await deleteScheduleDraft(divisionId).catch(error =>
      console.error('Failed to delete schedule draft', error)
    );
  }, [divisionId]);

  const discardDraft = useCallback(async () => {
    await clearDraft();
    onReset();
  }, [clearDraft, onReset]);

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
    edition,
    teamsCount,
    roomsCount,
    tablesCount,
    pairsCount,

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
    minJudgingSessionLength: secondsToTime(getMinimumJudgingSessionLength(edition)),
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
    saveDraft,
    captureDraftBaseline,
    discardDraft,
    clearDraft
  };

  return <ScheduleContext.Provider value={contextValue}>{children}</ScheduleContext.Provider>;
};

export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({
  children,
  eventId,
  divisionId,
  edition
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

  const { data: tables = [] } = useSWR<RobotGameTable[]>(
    `/admin/events/${eventId}/divisions/${divisionId}/tables`,
    { suspense: true }
  );

  const eventStartDate = dayjs(event.startDate).toISOString();
  const pairsCount = groupTablesByPair(tables).length;
  const fingerprint = useMemo<ScheduleDraftFingerprint>(
    () => ({
      eventStartDate,
      edition,
      teamsCount: teams.length,
      roomsCount: rooms.length,
      tablesCount: tables.length,
      pairsCount
    }),
    [eventStartDate, edition, teams.length, rooms.length, tables.length, pairsCount]
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

  const onReset = useCallback(() => {
    setDraftState({ fingerprint, draft: null });
    setResetCount(prev => prev + 1);
  }, [fingerprint]);

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
      edition={edition}
      fingerprint={fingerprint}
      draft={draftState.draft}
      onReset={onReset}
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
