'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dayjs } from 'dayjs';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, DragState, ScheduleBlockType, ScheduleColumn } from './calendar-types';
import { createScheduleBlock } from './calendar-utils';

const createBlocks = (
  blockType: ScheduleBlockType,
  column: ScheduleColumn,
  startTime: Dayjs,
  number: number,
  cycleTime: Dayjs
) => {
  const blocks: ScheduleBlock[] = [];
  let currentTime = startTime.clone();

  for (let index = 1; index <= number; index++) {
    const endTime = currentTime
      .add(cycleTime.hour(), 'hour')
      .add(cycleTime.minute(), 'minute')
      .add(cycleTime.second(), 'second');
    blocks.push(createScheduleBlock(blockType, column, currentTime, endTime, index));
    currentTime = endTime.clone();
  }

  return blocks;
};

export interface CalendarContextType {
  blocks: ScheduleBlock[];
  dragState: DragState;
  setBlocks: React.Dispatch<React.SetStateAction<ScheduleBlock[]>>;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  addBlock: (block: ScheduleBlock) => void;
  removeBlock: (blockId: string) => void;
  updateBlock: (blockId: string, updates: Partial<ScheduleBlock>) => void;
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
    judgingStart,
    judgingSessions,
    judgingSessionCycleTime
  } = useSchedule();

  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => {
    let blocks_: ScheduleBlock[] = [];

    blocks_ = blocks_.concat(
      createBlocks(
        'judging-session',
        'judging',
        judgingStart,
        judgingSessions,
        judgingSessionCycleTime
      )
    );

    blocks_ = blocks_.concat(
      createBlocks('practice-round', 'field', fieldStart, practiceRounds, practiceCycleTime)
    );

    const rankingStart = blocks_[blocks_.length - 1].endTime;
    blocks_ = blocks_.concat(
      createBlocks('ranking-round', 'field', rankingStart, rankingRounds, rankingCycleTime)
    );

    return blocks_;
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStartY: 0,
    draggedPosition: 0,
    originalPosition: 0
  });

  const addBlock = (block: ScheduleBlock) => {
    setBlocks(prev => [...prev, block]);
  };

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const updateBlock = (blockId: string, updates: Partial<ScheduleBlock>) => {
    setBlocks(prev => prev.map(block => (block.id === blockId ? { ...block, ...updates } : block)));
  };

  const contextValue: CalendarContextType = {
    blocks,
    dragState,
    setBlocks,
    setDragState,
    addBlock,
    removeBlock,
    updateBlock
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

export default CalendarProvider;
