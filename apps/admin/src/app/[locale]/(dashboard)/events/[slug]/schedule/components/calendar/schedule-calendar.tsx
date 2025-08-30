'use client';

import { useEffect, useRef, useCallback } from 'react';
import dayjs from 'dayjs';
import { Paper } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, TIME_SLOT_HEIGHT, INTERVAL_MINUTES, HEADER_HEIGHT } from './calendar-types';
import { CalendarGrid } from './calendar-grid';
import { CalendarColumn } from './calender-column';
import { CalendarProvider, useCalendar } from './calendar-context';
import { CalendarHeader } from './calendar-header';
import { calculateBlockPosition, getBlockColumn } from './calendar-utils';

function snapToGrid(yPosition: number): number {
  const slotHeight = INTERVAL_MINUTES * TIME_SLOT_HEIGHT;
  return Math.round(yPosition / slotHeight) * slotHeight;
}

const ScheduleCalendarContent: React.FC = () => {
  const event = useEvent();
  const startTime = dayjs(event.startDate).hour(6);

  const { setFieldStart, setJudgingStart } = useSchedule();
  const { blocks, dragState, setDragState, updateColumn } = useCalendar();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current || !dragState.draggedBlock) return;

      const mouseDelta = e.clientY - dragState.dragStartY;
      const newPosition = dragState.originalPosition + mouseDelta;
      const snappedPosition = snapToGrid(newPosition - HEADER_HEIGHT) + HEADER_HEIGHT; // Account for header

      setDragState(prev => ({
        ...prev,
        draggedPosition: snappedPosition
      }));
    },
    [dragState, setDragState]
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
    updateColumn
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
        height: '1000px', // TODO: Dynamic height that takes up the viewport
        overflowY: 'auto',
        position: 'relative',
        userSelect: dragState.isDragging ? 'none' : 'auto',
        cursor: dragState.isDragging ? 'grabbing' : 'default'
      }}
    >
      <CalendarHeader />

      <CalendarGrid>
        <CalendarColumn name="judging" handleDragStart={handleDragStart} />
        <CalendarColumn name="field" handleDragStart={handleDragStart} />
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
