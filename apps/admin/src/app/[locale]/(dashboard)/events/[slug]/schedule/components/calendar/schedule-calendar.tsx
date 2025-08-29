'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, TIME_SLOT_HEIGHT, INTERVAL_MINUTES, HEADER_HEIGHT } from './calendar-types';
import {
  adjustOrCreateBreak,
  removeBreak,
  snapToGrid,
  createScheduleBlock,
  calculateBlockPosition,
  reducePreviousBreak,
  deleteBlockAndMergeBreaks,
  renumberRounds
} from './calendar-utils';
import { CalendarGrid } from './calendar-grid';
import { CalendarColumn } from './calender-column';
import { CalendarHeader } from './calendar-header';
import CalendarProvider, { useCalendar } from './calendar-context';

const ScheduleCalendarContent: React.FC = () => {
  const t = useTranslations('pages.events.schedule.calendar');

  // Event start time for some reason
  const event = useEvent();
  const startTime = dayjs(event.startDate).hour(6);

  const {
    teamsCount,
    tablesCount,
    practiceRounds,
    rankingRounds,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    setFieldStart,
    setJudgingStart,
    addRankingRound,
    removeRankingRound,
    addPracticeRound,
    removePracticeRound
  } = useSchedule();

  const { blocks, dragState, setBlocks, setDragState } = useCalendar();

  const containerRef = useRef<HTMLDivElement>(null);

  // Group blocks by column
  const columnBlocks = useMemo(() => {
    return {
      judging: blocks
        .filter(b => b.column === 'judging')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf()),
      field: blocks
        .filter(b => b.column === 'field')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf())
    };
  }, [blocks]);

  const handleDragStart = useCallback(
    (block: ScheduleBlock, startY: number) => {
      // Prevent dragging breaks - they are calculated components
      if (block.type === 'break') return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate the block's current position
      const blockPosition = calculateBlockPosition(startTime, block.startTime, block.endTime);
      const blockTop = blockPosition.top + HEADER_HEIGHT;

      setDragState({
        isDragging: true,
        draggedBlock: block,
        dragStartY: startY,
        draggedPosition: blockTop, // Start at current block position
        originalPosition: blockTop
      });
    },
    [setDragState, startTime]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current || !dragState.draggedBlock) return;

      const mouseDelta = e.clientY - dragState.dragStartY;
      const newPosition = dragState.originalPosition + mouseDelta;
      const snappedPosition = snapToGrid(newPosition - 40) + 40; // Account for header

      setDragState(prev => ({
        ...prev,
        draggedPosition: snappedPosition
      }));
    },
    [
      dragState.isDragging,
      dragState.draggedBlock,
      dragState.dragStartY,
      dragState.originalPosition,
      setDragState
    ]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedBlock) {
      setDragState({
        isDragging: false,
        dragStartY: 0,
        draggedPosition: 0,
        originalPosition: 0
      });
      return;
    }

    const block = dragState.draggedBlock;
    const positionDiff = dragState.draggedPosition - dragState.originalPosition;
    const timeDiffMinutes = Math.round(positionDiff / TIME_SLOT_HEIGHT);
    const timeDiff = Math.round(timeDiffMinutes / INTERVAL_MINUTES) * INTERVAL_MINUTES; // Snap to 5-minute intervals

    if (Math.abs(timeDiff) >= 5) {
      // Only apply changes if moved at least 5 minutes

      // Check if this is the first block in its column (non-break blocks only)
      const columnNonBreakBlocks = columnBlocks[block.column]
        .filter(b => b.type !== 'break')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());
      const isFirstBlock =
        columnNonBreakBlocks.length > 0 && columnNonBreakBlocks[0].id === block.id;

      if (isFirstBlock) {
        // This is the first block - shift only this column's schedule and update start time
        if (block.column === 'judging') {
          setJudgingStart(prev => prev.add(timeDiff, 'minute'));
        } else {
          setFieldStart(prev => prev.add(timeDiff, 'minute'));
        }

        setBlocks(prev =>
          prev.map(b => {
            // Only shift blocks in the same column
            if (b.column === block.column) {
              return {
                ...b,
                startTime: b.startTime.add(timeDiff, 'minute'),
                endTime: b.endTime.add(timeDiff, 'minute')
              };
            }
            return b;
          })
        );
      } else {
        // Handle regular block movement (creates/adjusts breaks)
        if (timeDiff > 0) {
          // Moving forward - create or extend break before this block
          setBlocks(prev => adjustOrCreateBreak(prev, block.column, block, timeDiff));
        } else if (timeDiff < 0) {
          // Moving backward - try to reduce previous break
          setBlocks(prev => reducePreviousBreak(prev, block.column, block, timeDiff));
        }
      }
    }

    setDragState({
      isDragging: false,
      dragStartY: 0,
      draggedPosition: 0,
      originalPosition: 0
    });
  }, [
    dragState.isDragging,
    dragState.draggedBlock,
    dragState.draggedPosition,
    dragState.originalPosition,
    setDragState,
    columnBlocks,
    setBlocks,
    setJudgingStart,
    setFieldStart
  ]);

  // Handle deleting blocks
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      // Prevent deletion of judging sessions
      if (block.type === 'judging-session') {
        console.warn('Judging sessions cannot be deleted');
        return;
      }

      if (block.type === 'break') {
        // For breaks, just remove them without merging
        setBlocks(prev => removeBreak(prev, blockId));
      } else if (block.type === 'practice-round') {
        // Simply remove the practice round and merge breaks, then renumber
        setBlocks(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, blockId);
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
          return blocksAfterRemoval;
        });
        removePracticeRound();
      } else if (block.type === 'ranking-round') {
        // Simply remove the ranking round and merge breaks, then renumber
        setBlocks(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, blockId);
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
          return blocksAfterRemoval;
        });

        removeRankingRound();
      }
    },
    [blocks, removePracticeRound, removeRankingRound, setBlocks]
  );

  // Handle adding rounds
  const handleAddPracticeRound = useCallback(() => {
    // Find the first ranking round to insert a practice round before it
    const firstRanking = blocks.find(b => b.type === 'ranking-round' && b.roundNumber === 1);
    if (!firstRanking) return;

    // Calculate the duration for a practice round
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const practiceRoundDuration =
      (practiceCycleTime.minute() * 60 + practiceCycleTime.second()) * matchesPerRound;

    // The insertion time is where the first ranking round currently starts
    const insertionTime = firstRanking.startTime;
    const newPracticeStart = insertionTime;
    const newPracticeEnd = insertionTime.add(practiceRoundDuration, 'second');

    setBlocks(prev => {
      // Create the new practice round
      const newPracticeRound = createScheduleBlock(
        'practice-round',
        'field',
        newPracticeStart,
        newPracticeEnd,
        practiceRounds + 1 // This will be renumbered correctly
      );

      // Shift all field blocks that start at or after the insertion time forward by the practice round duration
      const updatedBlocks = prev.map(block => {
        if (
          block.column === 'field' &&
          (block.startTime.isSame(insertionTime) || block.startTime.isAfter(insertionTime))
        ) {
          return {
            ...block,
            startTime: block.startTime.add(practiceRoundDuration, 'second'),
            endTime: block.endTime.add(practiceRoundDuration, 'second')
          };
        }
        return block;
      });

      // Add the new practice round to the shifted blocks
      let finalBlocks = [...updatedBlocks, newPracticeRound];

      // Renumber all rounds to ensure correct sequential numbering
      finalBlocks = renumberRounds(finalBlocks);

      return finalBlocks;
    });

    addPracticeRound();
  }, [
    blocks,
    teamsCount,
    tablesCount,
    staggerMatches,
    practiceCycleTime,
    setBlocks,
    practiceRounds,
    addPracticeRound
  ]);

  const handleAddRankingRound = useCallback(() => {
    const lastFieldBlock = columnBlocks.field[columnBlocks.field.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const newRankingEnd = newRankingStart.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    setBlocks(prev => {
      let updatedBlocks = [
        ...prev,
        createScheduleBlock(
          'ranking-round',
          'field',
          newRankingStart,
          newRankingEnd,
          rankingRounds + 1
        )
      ];

      updatedBlocks = renumberRounds(updatedBlocks);

      return updatedBlocks;
    });

    addRankingRound();
  }, [
    columnBlocks.field,
    teamsCount,
    tablesCount,
    staggerMatches,
    rankingCycleTime,
    setBlocks,
    addRankingRound,
    rankingRounds
  ]);

  // Set up event listeners
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <Paper
      ref={containerRef}
      sx={{
        height: '1000px', // TODO: Dynamic height that takes up the viewport
        overflowY: 'auto',
        position: 'relative',
        userSelect: dragState.isDragging ? 'none' : 'auto',
        cursor: dragState.isDragging ? 'grabbing' : 'default'
      }}
    >
      <CalendarHeader
        onAddPracticeRound={handleAddPracticeRound}
        onAddRankingRound={handleAddRankingRound}
      />

      <CalendarGrid>
        <CalendarColumn
          title={t('judging.title')}
          blocks={columnBlocks.judging}
          handleDragStart={handleDragStart}
          handleDeleteBlock={handleDeleteBlock}
          dragState={dragState}
        />
        <CalendarColumn
          title={t('field.title')}
          blocks={columnBlocks.field}
          handleDragStart={handleDragStart}
          handleDeleteBlock={handleDeleteBlock}
          dragState={dragState}
        />
      </CalendarGrid>
    </Paper>
  );
};

export const ScheduleCalendar: React.FC = () => {
  return (
    <CalendarProvider>
      <ScheduleCalendarContent />
    </CalendarProvider>
  );
};
