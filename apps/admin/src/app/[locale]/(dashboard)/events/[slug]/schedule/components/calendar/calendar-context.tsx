'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dayjs } from 'dayjs';
import { nanoid } from 'nanoid';
import { useSchedule } from '../schedule-context';
import {
  BlocksByType,
  DragState,
  ScheduleBlock,
  ScheduleBlockType,
  ScheduleColumn,
  AgendaBlock,
  AgendaBlockVisibility
} from './calendar-types';
import { getDuration } from './calendar-utils';

const createBlock = (
  type: ScheduleBlockType,
  startTime: Dayjs,
  durationSeconds: number
): ScheduleBlock => {
  const id = nanoid(12);

  return {
    id,
    type,
    startTime,
    durationSeconds
  };
};

const createAgendaBlock = (
  startTime: Dayjs,
  durationSeconds: number,
  title: string,
  visibilty: AgendaBlockVisibility,
  location: string | null
): AgendaBlock => {
  const id = nanoid(12);

  return {
    id,
    type: 'agenda-event',
    startTime,
    durationSeconds,
    title,
    visibilty,
    location
  };
};

const createInitialBlocks = (
  blockType: ScheduleBlockType,
  startTime: Dayjs,
  number: number,
  cycleTime: Dayjs,
  eventsPerBlock: number = 1
) => {
  const blocks: ScheduleBlock[] = [];
  let currentTime = startTime.clone();

  for (let index = 1; index <= number; index++) {
    const eventDurationSeconds = getDuration(cycleTime) * eventsPerBlock;
    blocks.push(createBlock(blockType, currentTime, eventDurationSeconds));
    currentTime = currentTime.add(eventDurationSeconds, 'second');
  }

  return blocks;
};

export interface CalendarContextType {
  blocks: BlocksByType;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  editingBlockId: string | null;
  setEditingBlockId: React.Dispatch<React.SetStateAction<string | null>>;
  addPracticeRound: () => void;
  addRankingRound: () => void;
  deleteFieldBlock: (blockId: string) => void;
  updateColumn: (column: ScheduleColumn, blockId: string, newStartTime: Dayjs) => void;
  addAgendaEvent: (
    startTime: Dayjs,
    durationSeconds: number,
    title: string,
    location?: string | null
  ) => void;
  updateAgendaEvent: (blockId: string, updates: Partial<AgendaBlock>) => void;
  deleteAgendaEvent: (blockId: string) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export interface CalendarProviderProps {
  children: ReactNode;
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const {
    fieldStart,
    practiceCycleTime,
    practiceRounds,
    rankingCycleTime,
    rankingRounds,
    matchesPerRound,
    judgingStart,
    judgingSessions,
    judgingSessionCycleTime,
    setPracticeRounds,
    setRankingRounds
  } = useSchedule();

  const [blocks, setBlocks] = useState<BlocksByType>(() => {
    let judgingBlocks: ScheduleBlock[] = [];
    let fieldBlocks: ScheduleBlock[] = [];
    const agendaBlocks: AgendaBlock[] = [];

    judgingBlocks = judgingBlocks.concat(
      createInitialBlocks('judging-session', judgingStart, judgingSessions, judgingSessionCycleTime)
    );

    fieldBlocks = fieldBlocks.concat(
      createInitialBlocks(
        'practice-round',
        fieldStart,
        practiceRounds,
        practiceCycleTime,
        matchesPerRound
      )
    );

    const lastPracticeMatch = fieldBlocks[fieldBlocks.length - 1];
    const rankingStart = lastPracticeMatch.startTime.add(
      lastPracticeMatch.durationSeconds,
      'seconds'
    );
    fieldBlocks = fieldBlocks.concat(
      createInitialBlocks(
        'ranking-round',
        rankingStart,
        rankingRounds,
        rankingCycleTime,
        matchesPerRound
      )
    );

    return { field: fieldBlocks, judging: judgingBlocks, agenda: agendaBlocks };
  });

  /**
   * Update the duration and start time of judging blocks when:
   * 1. Judging cycle time updated
   * 2. Judging start time updated
   */
  useEffect(() => {
    const judgingCycleDuration = getDuration(judgingSessionCycleTime);
    const startTimeDiff = judgingStart.diff(blocks.judging[0].startTime, 'seconds');

    for (let index = 0; index < blocks.judging.length; index++) {
      const block = { ...blocks.judging[index] };

      const timeDiff = judgingCycleDuration - block.durationSeconds;
      block.durationSeconds = judgingCycleDuration;
      block.startTime = block.startTime
        .add(index * timeDiff, 'seconds')
        .add(startTimeDiff, 'seconds');
      updateBlock('judging', block.id, block);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [judgingSessionCycleTime, judgingStart]);

  /**
   * Update the duration and start time of field blocks when:
   * 1. Field start time changes
   * 2. Practice cycle time changes
   * 3. Ranking cycle time changes
   * 4. Matches per round changes
   */
  useEffect(() => {
    const practiceCycleDuration = getDuration(practiceCycleTime) * matchesPerRound;
    const rankingCycleDuration = getDuration(rankingCycleTime) * matchesPerRound;
    const startTimeDiff = fieldStart.diff(blocks.field[0].startTime, 'seconds');

    for (let index = 0; index < blocks.field.length; index++) {
      const block = { ...blocks.field[index] };

      const firstPractice = blocks.field.find(b => b.type === 'practice-round');
      const firstRanking = blocks.field.find(b => b.type === 'ranking-round');

      if (!firstPractice || !firstRanking) {
        console.error('No practice or ranking rounds found in field blocks');
        return; // Should never happen
      }

      const practiceTimeDiff = practiceCycleDuration - (firstPractice?.durationSeconds || 0);
      const rankingTimeDiff = rankingCycleDuration - (firstRanking?.durationSeconds || 0);

      if (block.type === 'practice-round') {
        block.durationSeconds = practiceCycleDuration;
        block.startTime = block.startTime
          .add(index * practiceTimeDiff, 'seconds')
          .add(startTimeDiff, 'seconds');
      }

      if (block.type === 'ranking-round') {
        block.durationSeconds = rankingCycleDuration;
        block.startTime = block.startTime
          .add(practiceRounds * practiceTimeDiff, 'seconds')
          .add((index - practiceRounds) * rankingTimeDiff, 'seconds')
          .add(startTimeDiff, 'seconds');
      }

      updateBlock('field', block.id, block);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldStart, matchesPerRound, practiceCycleTime, rankingCycleTime]);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStartY: 0,
    draggedPosition: 0,
    originalPosition: 0
  });

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const addPracticeRound = () => {
    const currentPracticeRounds = practiceRounds;
    const newFieldBlocks = [...blocks.field];

    const lastRound = newFieldBlocks[currentPracticeRounds - 1];
    const startTime = lastRound.startTime.add(lastRound.durationSeconds, 'seconds');

    const practiceCycleDuration = getDuration(practiceCycleTime) * matchesPerRound;

    newFieldBlocks.splice(
      currentPracticeRounds,
      0,
      createBlock('practice-round', startTime, practiceCycleDuration)
    );

    for (const block of newFieldBlocks) {
      if (block.type === 'ranking-round') {
        block.startTime = block.startTime.add(practiceCycleDuration, 'seconds');
      }
    }

    setBlocks(prev => ({ ...prev, field: newFieldBlocks }));
    setPracticeRounds(prev => prev + 1);
  };

  const addRankingRound = () => {
    const newFieldBlocks = [...blocks.field];

    const lastRound = newFieldBlocks[newFieldBlocks.length - 1];
    const startTime = lastRound.startTime.add(lastRound.durationSeconds, 'seconds');
    const rankingCycleDuration = getDuration(rankingCycleTime) * matchesPerRound;

    newFieldBlocks.push(createBlock('ranking-round', startTime, rankingCycleDuration));

    setBlocks(prev => ({ ...prev, field: newFieldBlocks }));
    setRankingRounds(prev => prev + 1);
  };

  const updateBlock = (
    column: ScheduleColumn,
    blockId: string,
    updates: Partial<ScheduleBlock>
  ) => {
    setBlocks(prev => ({
      ...prev,
      [column]: prev[column].map(block => (block.id === blockId ? { ...block, ...updates } : block))
    }));
  };

  const updateColumn = (column: ScheduleColumn, blockId: string, newStartTime: Dayjs) => {
    const blockIndex = blocks[column].findIndex(block => block.id === blockId);
    if (blockIndex === -1) return; // Block not found

    const originalBlock = { ...blocks[column][blockIndex] };
    const timeDiff = newStartTime.diff(originalBlock.startTime, 'seconds');

    for (let index = blockIndex; index < blocks[column].length; index++) {
      const block = { ...blocks[column][index] };
      block.startTime = block.startTime.add(timeDiff, 'seconds');
      updateBlock(column, block.id, block);
    }
  };

  const deleteFieldBlock = (blockId: string) => {
    const newBlocks = [...blocks.field];
    const index = newBlocks.findIndex(block => block.id === blockId);
    if (index === -1) return; // Block not found

    const [deleted] = newBlocks.splice(index, 1);

    for (let i = index; i < newBlocks.length; i++) {
      const block = newBlocks[i];
      block.startTime = block.startTime.subtract(deleted.durationSeconds, 'seconds');
    }

    setBlocks(prev => ({ ...prev, field: newBlocks }));

    // update counters
    if (deleted.type === 'practice-round') {
      setPracticeRounds(prevRounds => prevRounds - 1);
    }

    if (deleted.type === 'ranking-round') {
      setRankingRounds(prevRounds => prevRounds - 1);
    }
  };

  const addAgendaEvent = (
    startTime: Dayjs,
    durationSeconds: number,
    title: string,
    location?: string | null
  ) => {
    const newEvent = createAgendaBlock(
      startTime,
      durationSeconds,
      title,
      'public',
      location || null
    );
    setBlocks(prev => ({
      ...prev,
      agenda: [...prev.agenda, newEvent].sort((a, b) => a.startTime.diff(b.startTime))
    }));
  };

  const updateAgendaEvent = (blockId: string, updates: Partial<AgendaBlock>) => {
    updateBlock('agenda', blockId, updates);
  };

  const deleteAgendaEvent = (blockId: string) => {
    setBlocks(prev => ({
      ...prev,
      agenda: prev.agenda.filter(block => block.id !== blockId)
    }));
  };

  const contextValue: CalendarContextType = {
    blocks,
    dragState,
    setDragState,
    editingBlockId,
    setEditingBlockId,
    addPracticeRound,
    addRankingRound,
    deleteFieldBlock,
    updateColumn,
    addAgendaEvent,
    updateAgendaEvent,
    deleteAgendaEvent
  };

  return <CalendarContext.Provider value={contextValue}>{children}</CalendarContext.Provider>;
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
