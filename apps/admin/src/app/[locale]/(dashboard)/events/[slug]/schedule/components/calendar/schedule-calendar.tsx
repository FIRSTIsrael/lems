'use client';

import { useEffect, useRef, useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Paper, Box } from '@mui/material';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../../../components/event-context';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, TIME_SLOT_HEIGHT, INTERVAL_MINUTES, HEADER_HEIGHT } from './calendar-types';
import { CalendarGrid } from './calendar-grid';
import { CalendarColumn } from './calender-column';
import { AgendaColumn } from './agenda-column';
import { CalendarProvider, useCalendar } from './calendar-context';
import { CalendarHeader } from './calendar-header';
import { calculateBlockPosition, getBlockColumn } from './calendar-utils';

function snapToGrid(yPosition: number, startTime: Dayjs): number {
  const currentTime = positionToTime(yPosition, startTime);

  // Snap to nearest 5-minute clock interval
  const currentMinute = currentTime.minute();
  const snappedMinute = Math.round(currentMinute / INTERVAL_MINUTES) * INTERVAL_MINUTES;
  const snappedTime = currentTime.minute(snappedMinute).second(0);

  return timeToPosition(snappedTime, startTime);
}

function timeToPosition(time: Dayjs, startTime: Dayjs): number {
  const minutesFromStart = time.diff(startTime, 'minute');
  return minutesFromStart * TIME_SLOT_HEIGHT + HEADER_HEIGHT;
}

function positionToTime(position: number, startTime: Dayjs): Dayjs {
  const adjustedPosition = position - HEADER_HEIGHT;
  const minutesFromStart = adjustedPosition / TIME_SLOT_HEIGHT;
  const currentTime = startTime.add(minutesFromStart, 'minute');
  return currentTime;
}

const ScheduleCalendarContent: React.FC<{ division: Division }> = ({ division }) => {
  const event = useEvent();
  const startTime = dayjs(event.startDate).hour(6);
  const endTime = dayjs(event.endDate).hour(20);

  const { setFieldStart, setJudgingStart } = useSchedule();
  const { blocks, dragState, setDragState, updateColumn } = useCalendar();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current || !dragState.draggedBlock) return;

      const column = getBlockColumn(dragState.draggedBlock);
      const blockIndex = blocks[column].findIndex(block => block.id === dragState.draggedBlock?.id);
      if (blockIndex === -1) return;

      let minPosition = HEADER_HEIGHT; // Start of column
      const maxPosition = timeToPosition(
        endTime.subtract(dragState.draggedBlock.durationSeconds, 'second'),
        startTime
      ); // End of column

      // Prevent overlap with previous block
      if (blockIndex > 0) {
        const previousBlockEnd = blocks[column][blockIndex - 1].startTime.add(
          blocks[column][blockIndex - 1].durationSeconds,
          'second'
        );
        minPosition = timeToPosition(previousBlockEnd, startTime);
      }

      const mouseDelta = e.clientY - dragState.dragStartY;
      const newPosition = dragState.originalPosition + mouseDelta;
      const snappedPosition = snapToGrid(newPosition, startTime);

      const finalPosition = Math.min(Math.max(snappedPosition, minPosition), maxPosition);

      setDragState(prev => ({
        ...prev,
        draggedPosition: finalPosition
      }));
    },
    [dragState, blocks, endTime, startTime, setDragState]
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

    const finalTime = positionToTime(dragState.draggedPosition, startTime);
    const originalTime = positionToTime(dragState.originalPosition, startTime);
    const timeDiff = finalTime.diff(originalTime, 'minute');

    const blockColumn = getBlockColumn(block);
    const isFirstBlock = blocks[`${blockColumn}`][0].id === block.id;
    if (isFirstBlock) {
      if (Math.abs(timeDiff) >= 5) {
        if (blockColumn === 'judging') {
          setJudgingStart(prev => prev.add(timeDiff, 'minute'));
        } else {
          setFieldStart(prev => prev.add(timeDiff, 'minute'));
        }
      }
    } else {
      updateColumn(blockColumn, block.id, block.startTime.add(timeDiff, 'minute'));
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
    blocks,
    setDragState,
    setJudgingStart,
    setFieldStart,
    updateColumn,
    startTime
  ]);

  const handleDragStart = useCallback(
    (block: ScheduleBlock, startY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const blockPosition = calculateBlockPosition(startTime, block);
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
        height: '100%',
        overflowY: 'auto',
        position: 'relative',
        userSelect: dragState.isDragging ? 'none' : 'auto',
        cursor: dragState.isDragging ? 'grabbing' : 'default'
      }}
    >
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'background.paper' }}>
        <CalendarHeader division={division} />
      </Box>

      <CalendarGrid>
        <CalendarColumn name="judging" handleDragStart={handleDragStart} />
        <CalendarColumn name="field" handleDragStart={handleDragStart} />
        <AgendaColumn startTime={startTime} endTime={endTime} />
      </CalendarGrid>
    </Paper>
  );
};

export const ScheduleCalendar: React.FC<{ division: Division }> = ({ division }) => {
  return (
    <CalendarProvider>
      <ScheduleCalendarContent division={division} />
    </CalendarProvider>
  );
};
