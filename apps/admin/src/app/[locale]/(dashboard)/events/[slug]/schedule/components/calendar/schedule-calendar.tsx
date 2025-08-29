'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Paper, Typography, Stack } from '@mui/material';
import { useSchedule } from '../schedule-context';
import {
  ScheduleBlock,
  CalendarState,
  DragState,
  TIME_SLOT_HEIGHT,
  INTERVAL_MINUTES
} from './calendar-types';
import {
  generateInitialSchedule,
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

export const ScheduleCalendar: React.FC = () => {
  const t = useTranslations('pages.events.schedule.calendar');

  const {
    teamsCount,
    roomsCount,
    tablesCount,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime
  } = useSchedule();

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragStartY: 0,
    draggedPosition: 0,
    originalPosition: 0
  });

  // Calendar state with initial schedule
  const [calendarState, setCalendarState] = useState<CalendarState>(() => {
    const baseStartTime = dayjs().hour(8).minute(0).second(0);
    return {
      blocks: [],
      practiceRounds: 1,
      rankingRounds: 3,
      judgingStartTime: baseStartTime,
      fieldStartTime: baseStartTime
    };
  });

  // Time range for the calendar (6 AM to 8 PM) - based on the earlier start time
  const timeRange = useMemo(() => {
    const earliestStart = calendarState.judgingStartTime.isBefore(calendarState.fieldStartTime)
      ? calendarState.judgingStartTime
      : calendarState.fieldStartTime;
    return {
      start: earliestStart.hour(6).minute(0),
      end: earliestStart.hour(20).minute(0)
    };
  }, [calendarState.judgingStartTime, calendarState.fieldStartTime]);

  // Initialize schedule when context changes
  useEffect(() => {
    const baseStartTime = dayjs().hour(8).minute(0).second(0);
    const { blocks, judgingStartTime, fieldStartTime } = generateInitialSchedule(
      baseStartTime,
      teamsCount,
      roomsCount,
      tablesCount,
      staggerMatches,
      practiceCycleTime,
      rankingCycleTime,
      judgingSessionCycleTime
    );

    setCalendarState(prev => ({
      ...prev,
      blocks,
      judgingStartTime,
      fieldStartTime
    }));
  }, [
    teamsCount,
    roomsCount,
    tablesCount,
    staggerMatches,
    practiceCycleTime,
    rankingCycleTime,
    judgingSessionCycleTime
  ]);

  // Group blocks by column
  const columnBlocks = useMemo(() => {
    return {
      judging: calendarState.blocks
        .filter(b => b.column === 'judging')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf()),
      field: calendarState.blocks
        .filter(b => b.column === 'field')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf())
    };
  }, [calendarState.blocks]);

  // Handle drag start
  const handleDragStart = useCallback(
    (block: ScheduleBlock, startY: number) => {
      // Prevent dragging breaks - they are calculated components
      if (block.type === 'break') return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate the block's current position
      const blockPosition = calculateBlockPosition(timeRange.start, block.startTime, block.endTime);
      // Account for header height (40px)
      const blockTop = blockPosition.top + 40;

      setDragState({
        isDragging: true,
        draggedBlock: block,
        dragStartY: startY,
        draggedPosition: blockTop, // Start at current block position
        originalPosition: blockTop
      });
    },
    [timeRange.start]
  );

  // Handle mouse move during drag
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
    [dragState.isDragging, dragState.dragStartY, dragState.originalPosition, dragState.draggedBlock]
  );

  // Handle mouse up (end drag)
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
        const columnStartTimeKey =
          block.column === 'judging' ? 'judgingStartTime' : 'fieldStartTime';

        setCalendarState(prev => ({
          ...prev,
          [columnStartTimeKey]: prev[columnStartTimeKey].add(timeDiff, 'minute'),
          blocks: prev.blocks.map(b => {
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
        }));
      } else {
        // Handle regular block movement (creates/adjusts breaks)
        if (timeDiff > 0) {
          // Moving forward - create or extend break before this block
          setCalendarState(prev => ({
            ...prev,
            blocks: adjustOrCreateBreak(prev.blocks, block.column, block, timeDiff)
          }));
        } else if (timeDiff < 0) {
          // Moving backward - try to reduce previous break
          setCalendarState(prev => ({
            ...prev,
            blocks: reducePreviousBreak(prev.blocks, block.column, block, timeDiff)
          }));
        }
      }
    }

    setDragState({
      isDragging: false,
      dragStartY: 0,
      draggedPosition: 0,
      originalPosition: 0
    });
  }, [dragState, columnBlocks]);

  // Handle deleting blocks
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const block = calendarState.blocks.find(b => b.id === blockId);
      if (!block) return;

      // Prevent deletion of judging sessions
      if (block.type === 'judging-session') {
        console.warn('Judging sessions cannot be deleted');
        return;
      }

      if (block.type === 'break') {
        // For breaks, just remove them without merging
        setCalendarState(prev => ({
          ...prev,
          blocks: removeBreak(prev.blocks, blockId)
        }));
      } else if (block.type === 'practice-match') {
        // Simply remove the practice round and merge breaks, then renumber
        setCalendarState(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev.blocks, blockId);

          // Renumber all rounds after deletion to maintain separate numbering
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);

          return {
            ...prev,
            blocks: blocksAfterRemoval,
            practiceRounds: prev.practiceRounds - 1
          };
        });
      } else if (block.type === 'ranking-match') {
        // Simply remove the ranking round and merge breaks, then renumber
        setCalendarState(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev.blocks, blockId);

          // Renumber all rounds after deletion to maintain separate numbering
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);

          return {
            ...prev,
            blocks: blocksAfterRemoval,
            rankingRounds: prev.rankingRounds - 1
          };
        });
      }
    },
    [calendarState.blocks]
  );

  // Handle adding rounds
  const handleAddPracticeRound = useCallback(() => {
    // Find the first ranking round to insert a practice round before it
    const firstRanking = calendarState.blocks.find(
      b => b.type === 'ranking-match' && b.roundNumber === 1
    );
    if (!firstRanking) return;

    // Calculate the duration for a practice round
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const practiceRoundDuration =
      (practiceCycleTime.minute() * 60 + practiceCycleTime.second()) * matchesPerRound;

    // The insertion time is where the first ranking round currently starts
    const insertionTime = firstRanking.startTime;
    const newPracticeStart = insertionTime;
    const newPracticeEnd = insertionTime.add(practiceRoundDuration, 'second');

    setCalendarState(prev => {
      // Create the new practice round
      const newPracticeRound = createScheduleBlock(
        'practice-match',
        'field',
        newPracticeStart,
        newPracticeEnd,
        prev.practiceRounds + 1 // This will be renumbered correctly
      );

      // Shift all field blocks that start at or after the insertion time forward by the practice round duration
      const updatedBlocks = prev.blocks.map(block => {
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

      return {
        ...prev,
        blocks: finalBlocks,
        practiceRounds: prev.practiceRounds + 1
      };
    });
  }, [calendarState.blocks, teamsCount, tablesCount, staggerMatches, practiceCycleTime]);

  const handleAddRankingRound = useCallback(() => {
    const lastFieldBlock = columnBlocks.field[columnBlocks.field.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const newRankingEnd = newRankingStart.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    setCalendarState(prev => {
      let updatedBlocks = [
        ...prev.blocks,
        createScheduleBlock(
          'ranking-match',
          'field',
          newRankingStart,
          newRankingEnd,
          prev.rankingRounds + 1
        )
      ];

      // Renumber all rounds to ensure consistency
      updatedBlocks = renumberRounds(updatedBlocks);

      return {
        ...prev,
        blocks: updatedBlocks,
        rankingRounds: prev.rankingRounds + 1
      };
    });
  }, [columnBlocks.field, teamsCount, tablesCount, staggerMatches, rankingCycleTime]);

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
          timeRange={timeRange}
        />
        <CalendarColumn
          title={t('field.title')}
          blocks={columnBlocks.field}
          handleDragStart={handleDragStart}
          handleDeleteBlock={handleDeleteBlock}
          dragState={dragState}
          timeRange={timeRange}
        />
      </CalendarGrid>

      {/* Stats display */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Stack direction="row" spacing={4}>
          <Typography variant="body2" color="text.secondary">
            {`${t('stats.practice-rounds')}: ${calendarState.practiceRounds}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${t('stats.ranking-rounds')}: ${calendarState.rankingRounds}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${t('stats.judging-start')}: ${calendarState.judgingStartTime.format('HH:mm')}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`${t('stats.field-start')}: ${calendarState.fieldStartTime.format('HH:mm')}`}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
