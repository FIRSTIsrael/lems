'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useSchedule } from './schedule-context';
import {
  ScheduleBlock,
  CalendarState,
  DragState,
  TIME_SLOT_HEIGHT,
  COLUMN_WIDTH,
  TIME_AXIS_WIDTH,
  MINUTES_PER_SLOT
} from './calendar-types';
import {
  generateTimeSlots,
  generateInitialSchedule,
  adjustOrCreateBreak,
  insertBreak,
  removeBreak,
  snapToGrid,
  createScheduleBlock,
  calculateBlockPosition,
  reducePreviousBreak
} from './calendar-utils';
import { ScheduleBlockComponent } from './schedule-block';
import { BreakIndicator } from './break-indicator';

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

  // Calculate derived values
  const totalMatches = useMemo(() => {
    return teamsCount * (calendarState.practiceRounds + calendarState.rankingRounds);
  }, [teamsCount, calendarState.practiceRounds, calendarState.rankingRounds]);

  const totalSessions = useMemo(() => {
    return Math.ceil(teamsCount / roomsCount);
  }, [teamsCount, roomsCount]);

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
    const timeDiff = Math.round(timeDiffMinutes / MINUTES_PER_SLOT) * MINUTES_PER_SLOT; // Snap to 5-minute intervals

    if (Math.abs(timeDiff) >= 5) {
      // Only apply changes if moved at least 5 minutes

      // Check if this is the first block in its column (non-break blocks only)
      const columnNonBreakBlocks = columnBlocks[block.column]
        .filter(b => b.type !== 'break')
        .sort((a, b) => a.startTime.valueOf() - b.startTime.valueOf());
      const isFirstBlock =
        columnNonBreakBlocks.length > 0 && columnNonBreakBlocks[0].id === block.id;

      if (block.type === 'break') {
        // Handle break resizing
        const newDuration = block.endTime.diff(block.startTime, 'minute') + timeDiff;
        if (newDuration <= 0) {
          // Remove break if duration becomes 0 or negative
          setCalendarState(prev => ({
            ...prev,
            blocks: removeBreak(prev.blocks, block.id)
          }));
        } else {
          // Resize break
          setCalendarState(prev => ({
            ...prev,
            blocks: prev.blocks.map(b =>
              b.id === block.id ? { ...b, endTime: b.endTime.add(timeDiff, 'minute') } : b
            )
          }));
        }
      } else if (isFirstBlock) {
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

  // Handle adding breaks
  const handleAddBreak = useCallback((column: 'judging' | 'field', insertTime: Dayjs) => {
    setCalendarState(prev => ({
      ...prev,
      blocks: insertBreak(prev.blocks, column, insertTime, 15) // Default 15 minute break
    }));
  }, []);

  // Handle deleting blocks
  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      const block = calendarState.blocks.find(b => b.id === blockId);
      if (!block) return;

      if (block.type === 'break') {
        setCalendarState(prev => ({
          ...prev,
          blocks: removeBreak(prev.blocks, blockId)
        }));
      } else if (block.type === 'practice-match') {
        // Remove practice round and convert first ranking to practice
        setCalendarState(prev => {
          const newBlocks = prev.blocks.filter(b => b.id !== blockId);
          const firstRanking = newBlocks.find(
            b => b.type === 'ranking-match' && b.roundNumber === 1
          );

          if (firstRanking) {
            const updatedBlocks = newBlocks.map(b =>
              b.id === firstRanking.id
                ? { ...b, type: 'practice-match' as const, title: 'Practice Round 1' }
                : b
            );
            return {
              ...prev,
              blocks: updatedBlocks,
              practiceRounds: prev.practiceRounds - 1
            };
          }

          return {
            ...prev,
            blocks: newBlocks,
            practiceRounds: prev.practiceRounds - 1
          };
        });
      } else if (block.type === 'ranking-match') {
        // Remove ranking round
        setCalendarState(prev => ({
          ...prev,
          blocks: prev.blocks.filter(b => b.id !== blockId),
          rankingRounds: prev.rankingRounds - 1
        }));
      }
    },
    [calendarState.blocks]
  );

  // Handle adding rounds
  const handleAddPracticeRound = useCallback(() => {
    // Convert first ranking to practice and add new ranking at end
    const firstRanking = calendarState.blocks.find(
      b => b.type === 'ranking-match' && b.roundNumber === 1
    );
    if (!firstRanking) return;

    const lastFieldBlock = columnBlocks.field[columnBlocks.field.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const newRankingEnd = newRankingStart.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    setCalendarState(prev => ({
      ...prev,
      blocks: [
        ...prev.blocks.map(b =>
          b.id === firstRanking.id
            ? {
                ...b,
                type: 'practice-match' as const,
                title: `Practice Round ${prev.practiceRounds + 1}`
              }
            : b
        ),
        createScheduleBlock(
          'ranking-match',
          'field',
          newRankingStart,
          newRankingEnd,
          prev.rankingRounds + 1
        )
      ],
      practiceRounds: prev.practiceRounds + 1
    }));
  }, [
    calendarState.blocks,
    columnBlocks.field,
    teamsCount,
    tablesCount,
    staggerMatches,
    rankingCycleTime
  ]);

  const handleAddRankingRound = useCallback(() => {
    const lastFieldBlock = columnBlocks.field[columnBlocks.field.length - 1];
    const newRankingStart = lastFieldBlock.endTime;
    const matchesPerRound = Math.ceil(teamsCount / tablesCount) * (staggerMatches ? 0.5 : 1);
    const newRankingEnd = newRankingStart.add(
      (rankingCycleTime.minute() * 60 + rankingCycleTime.second()) * matchesPerRound,
      'second'
    );

    setCalendarState(prev => ({
      ...prev,
      blocks: [
        ...prev.blocks,
        createScheduleBlock(
          'ranking-match',
          'field',
          newRankingStart,
          newRankingEnd,
          prev.rankingRounds + 1
        )
      ],
      rankingRounds: prev.rankingRounds + 1
    }));
  }, [columnBlocks.field, teamsCount, tablesCount, staggerMatches, rankingCycleTime]);

  // Test function to offset judging start time
  const handleOffsetJudgingStart = useCallback(() => {
    const offsetMinutes = 30; // Offset judging by 30 minutes
    setCalendarState(prev => ({
      ...prev,
      judgingStartTime: prev.judgingStartTime.add(offsetMinutes, 'minute'),
      blocks: prev.blocks.map(b => {
        if (b.column === 'judging') {
          return {
            ...b,
            startTime: b.startTime.add(offsetMinutes, 'minute'),
            endTime: b.endTime.add(offsetMinutes, 'minute')
          };
        }
        return b;
      })
    }));
  }, []);

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
      {/* Action buttons */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddPracticeRound}
          >
            Add Practice Round
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddRankingRound}
          >
            Add Ranking Round
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={handleOffsetJudgingStart}
          >
            Offset Judging +30min (Test)
          </Button>
        </Stack>
      </Box>

      {/* Calendar grid */}
      <Stack direction="row" sx={{ position: 'relative' }}>
        {/* Time axis */}
        <Stack
          width={TIME_AXIS_WIDTH}
          flexShrink={0}
          sx={{ borderRight: '1px solid', borderColor: 'divider' }}
        >
          <Box height={40} sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
          <Box>
            {generateTimeSlots(timeRange.start, timeRange.end).map((time, index) => (
              <Box
                key={index}
                height={TIME_SLOT_HEIGHT * MINUTES_PER_SLOT}
                display="flex"
                alignItems="center"
                px={1}
                sx={{
                  borderTop: index % (60 / MINUTES_PER_SLOT) === 0 ? '1px solid' : '1px solid',
                  borderColor:
                    index % (60 / MINUTES_PER_SLOT) === 0 ? 'divider' : 'rgba(0,0,0,0.06)',
                  backgroundColor: index % (60 / MINUTES_PER_SLOT) === 0 ? 'grey.50' : 'transparent'
                }}
              >
                {index % (60 / MINUTES_PER_SLOT) === 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {time.format('HH:mm')}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Stack>

        {/* Content area with background grid */}
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px),
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: `
              100% ${TIME_SLOT_HEIGHT * (60 / MINUTES_PER_SLOT)}px,
              100% ${TIME_SLOT_HEIGHT * (15 / MINUTES_PER_SLOT)}px
            `,
            backgroundPosition: '0 40px'
          }}
        >
          {/* Judging Column */}
          <Stack width={COLUMN_WIDTH} sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
            <Box
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6">{t('judging.title')}</Typography>
            </Box>
            <Box sx={{ position: 'relative', minHeight: '100%' }}>
              {columnBlocks.judging.map(block => {
                const nonBreakBlocks = columnBlocks.judging.filter(b => b.type !== 'break');
                const isFirstBlock = nonBreakBlocks.length > 0 && nonBreakBlocks[0].id === block.id;

                return (
                  <ScheduleBlockComponent
                    key={block.id}
                    block={block}
                    startTime={timeRange.start}
                    onDragStart={handleDragStart}
                    onDelete={handleDeleteBlock}
                    isDragging={dragState.isDragging && dragState.draggedBlock?.id === block.id}
                    dragPosition={dragState.draggedPosition}
                    isFirstBlock={isFirstBlock}
                  />
                );
              })}
              {/* Break indicators */}
              {columnBlocks.judging.map((block, index) => {
                const nextBlock = columnBlocks.judging[index + 1];
                return (
                  <BreakIndicator
                    key={`break-indicator-judging-${block.id}`}
                    topBlock={block}
                    bottomBlock={nextBlock}
                    startTime={timeRange.start}
                    onAddBreak={time => handleAddBreak('judging', time)}
                  />
                );
              })}
            </Box>
          </Stack>

          {/* Field Column */}
          <Stack width={COLUMN_WIDTH}>
            <Box
              sx={{
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="h6">{t('field.title')}</Typography>
            </Box>
            <Box sx={{ position: 'relative', minHeight: '100%' }}>
              {columnBlocks.field.map(block => {
                const nonBreakBlocks = columnBlocks.field.filter(b => b.type !== 'break');
                const isFirstBlock = nonBreakBlocks.length > 0 && nonBreakBlocks[0].id === block.id;

                return (
                  <ScheduleBlockComponent
                    key={block.id}
                    block={block}
                    startTime={timeRange.start}
                    onDragStart={handleDragStart}
                    onDelete={handleDeleteBlock}
                    isDragging={dragState.isDragging && dragState.draggedBlock?.id === block.id}
                    dragPosition={dragState.draggedPosition}
                    isFirstBlock={isFirstBlock}
                  />
                );
              })}
              {/* Break indicators */}
              {columnBlocks.field.map((block, index) => {
                const nextBlock = columnBlocks.field[index + 1];
                return (
                  <BreakIndicator
                    key={`break-indicator-field-${block.id}`}
                    topBlock={block}
                    bottomBlock={nextBlock}
                    startTime={timeRange.start}
                    onAddBreak={time => handleAddBreak('field', time)}
                  />
                );
              })}
            </Box>
          </Stack>
        </Box>
      </Stack>

      {/* Stats display */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'grey.50' }}>
        <Stack direction="row" spacing={4}>
          <Typography variant="body2" color="text.secondary">
            Total Matches: {totalMatches}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Sessions: {totalSessions}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Practice Rounds: {calendarState.practiceRounds}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ranking Rounds: {calendarState.rankingRounds}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Judging Start: {calendarState.judgingStartTime.format('HH:mm')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Field Start: {calendarState.fieldStartTime.format('HH:mm')}
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
};
