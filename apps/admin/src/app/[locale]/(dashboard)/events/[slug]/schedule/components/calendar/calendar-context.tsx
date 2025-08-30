'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dayjs } from 'dayjs';
import { useSchedule } from '../schedule-context';
import {
  BlocksByType,
  DragState,
  ScheduleBlock,
  ScheduleBlockType,
  ScheduleColumn
} from './calendar-types';
import { createScheduleBlock, getDuration } from './calendar-utils';

const createBlocks = (
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
    blocks.push(createScheduleBlock(blockType, currentTime, eventDurationSeconds));
    currentTime = currentTime.add(eventDurationSeconds, 'second');
  }

  return blocks;
};

export interface CalendarContextType {
  blocks: BlocksByType;
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  updateBlock: (column: ScheduleColumn, blockId: string, updates: Partial<ScheduleBlock>) => void;
  addPracticeRound: () => void;
  addRankingRound: () => void;
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

    judgingBlocks = judgingBlocks.concat(
      createBlocks('judging-session', judgingStart, judgingSessions, judgingSessionCycleTime)
    );

    fieldBlocks = fieldBlocks.concat(
      createBlocks('practice-round', fieldStart, practiceRounds, practiceCycleTime, matchesPerRound)
    );

    const lastPracticeMatch = fieldBlocks[fieldBlocks.length - 1];
    const rankingStart = lastPracticeMatch.startTime.add(
      lastPracticeMatch.durationSeconds,
      'seconds'
    );
    fieldBlocks = fieldBlocks.concat(
      createBlocks('ranking-round', rankingStart, rankingRounds, rankingCycleTime, matchesPerRound)
    );

    return { field: fieldBlocks, judging: judgingBlocks };
  });

  /**
   * Update the duration and start time of judging blocks when:
   * 1. Judging cycle time updated
   * 2. Judging start time updated
   */
  useEffect(() => {
    const judgingCycleDuration = getDuration(judgingSessionCycleTime);

    for (let index = 0; index < blocks.judging.length; index++) {
      const block = { ...blocks.judging[index] };

      block.durationSeconds = judgingCycleDuration;
      block.startTime = judgingStart.add(index * judgingCycleDuration, 'seconds');
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

    for (let index = 0; index < blocks.field.length; index++) {
      const block = { ...blocks.field[index] };

      if (block.type === 'practice-round') {
        block.durationSeconds = practiceCycleDuration;
        block.startTime = fieldStart.add(index * practiceCycleDuration, 'seconds');
      }

      if (block.type === 'ranking-round') {
        block.durationSeconds = rankingCycleDuration;
        block.startTime = fieldStart
          .add(practiceRounds * practiceCycleDuration, 'seconds')
          .add((index - practiceRounds) * rankingCycleDuration, 'seconds');
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

  const addPracticeRound = () => {
    const currentPracticeRounds = practiceRounds;
    const newFieldBlocks = [...blocks.field];

    const lastRound = newFieldBlocks[currentPracticeRounds - 1];
    const startTime = lastRound.startTime.add(lastRound.durationSeconds, 'seconds');

    const practiceCycleDuration = getDuration(practiceCycleTime) * matchesPerRound;

    newFieldBlocks.splice(
      currentPracticeRounds,
      0,
      createScheduleBlock('practice-round', startTime, practiceCycleDuration)
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

    newFieldBlocks.push(createScheduleBlock('ranking-round', startTime, rankingCycleDuration));

    setBlocks(prev => ({ ...prev, field: newFieldBlocks }));
    setRankingRounds(prev => prev + 1);
  };

  const contextValue: CalendarContextType = {
    blocks,
    dragState,
    setDragState,
    updateBlock,
    addPracticeRound,
    addRankingRound
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
