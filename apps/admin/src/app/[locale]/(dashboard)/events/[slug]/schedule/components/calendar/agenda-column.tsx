'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack } from '@mui/material';
import { HEADER_HEIGHT, TIME_SLOT_HEIGHT } from './calendar-types';
import { AgendaBlock } from './agenda-block';
import { useCalendar } from './calendar-context';

const SNAP_MINUTES = 5;
const DEFAULT_EVENT_DURATION = 60 * 60; // 1 hour in seconds
const MIN_CREATE_DURATION = 5 * 60; // 5 minutes in seconds

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

function snapToGrid(yPosition: number, startTime: Dayjs): number {
  const currentTime = positionToTime(yPosition, startTime);
  const currentMinute = currentTime.minute();
  const snappedMinute = Math.round(currentMinute / SNAP_MINUTES) * SNAP_MINUTES;
  const snappedTime = currentTime.minute(snappedMinute).second(0);
  return timeToPosition(snappedTime, startTime);
}

interface AgendaColumnProps {
  startTime: Dayjs;
  endTime: Dayjs;
}

type DragMode = 'body' | 'top-edge' | 'bottom-edge' | 'create' | null;

interface AgendaDragState {
  mode: DragMode;
  blockId?: string;
  startY: number;
  originalStartTime?: Dayjs;
  originalDuration?: number;
  draggedPosition: number;
  createStartPosition?: number; // For drag-to-create: where the drag started
  createCurrentPosition?: number; // For drag-to-create: current drag position
  dragStartPosition?: number; // For body drag: snapped position where drag started
}

export const AgendaColumn: React.FC<AgendaColumnProps> = ({ startTime, endTime }) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);

  const { blocks, addAgendaEvent, updateAgendaEvent } = useCalendar();
  const agendaBlocks = blocks.agenda;

  const [dragState, setDragState] = useState<AgendaDragState | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  // Handle click and drag to create new event
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !columnRef.current) return;

      const rect = columnRef.current.getBoundingClientRect();
      const yPos = e.clientY - rect.top;

      // Check if clicking on an existing block
      if ((e.target as HTMLElement).closest('[data-agenda-block]')) {
        return; // Let the block handle its own drag
      }

      // Start tracking click/drag
      const snappedStartPosition = snapToGrid(yPos, startTime);
      setDragState({
        mode: 'create',
        startY: e.clientY,
        draggedPosition: snappedStartPosition,
        createStartPosition: snappedStartPosition,
        createCurrentPosition: snappedStartPosition
      });
    },
    [startTime]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !columnRef.current) return;

      const rect = columnRef.current.getBoundingClientRect();
      const yPos = e.clientY - rect.top;
      const snappedPosition = snapToGrid(yPos, startTime);

      if (dragState.mode === 'create') {
        setDragState(prev => (prev ? { ...prev, createCurrentPosition: snappedPosition } : null));
      } else if (
        dragState.mode === 'body' &&
        dragState.blockId &&
        dragState.originalStartTime &&
        dragState.dragStartPosition !== undefined
      ) {
        // Move event body - track movement from initial drag start position
        // All positions are in document coordinates (include HEADER_HEIGHT)
        const currentYInColumn = yPos; // yPos is relative to column top
        const currentPosition = snapToGrid(currentYInColumn, startTime); // Returns document coordinates

        const dragStartPos = dragState.dragStartPosition; // Document coordinates
        const positionDelta = currentPosition - dragStartPos;

        const originalPosition = timeToPosition(dragState.originalStartTime, startTime); // Document coordinates
        const newPosition = originalPosition + positionDelta;

        // Clamp to bounds
        const maxPosition = timeToPosition(
          endTime.subtract(dragState.originalDuration || DEFAULT_EVENT_DURATION, 'second'),
          startTime
        );
        const finalPosition = Math.min(Math.max(newPosition, HEADER_HEIGHT), maxPosition);

        setDragState(prev =>
          prev
            ? {
                ...prev,
                draggedPosition: finalPosition
              }
            : null
        );
      } else if (
        dragState.mode === 'bottom-edge' &&
        dragState.blockId &&
        dragState.originalStartTime
      ) {
        // Resize by bottom edge
        const eventStart = timeToPosition(dragState.originalStartTime, startTime);
        const minDuration = SNAP_MINUTES * 60; // Minimum 5 minutes
        const newDuration = Math.max(
          ((snappedPosition - eventStart) / TIME_SLOT_HEIGHT) * 60,
          minDuration
        );
        const snappedDuration = Math.round(newDuration / (SNAP_MINUTES * 60)) * (SNAP_MINUTES * 60);

        setDragState(prev =>
          prev
            ? {
                ...prev,
                draggedPosition: eventStart + (snappedDuration / 60) * TIME_SLOT_HEIGHT,
                originalDuration: snappedDuration
              }
            : null
        );
      } else if (
        dragState.mode === 'top-edge' &&
        dragState.blockId &&
        dragState.originalStartTime &&
        dragState.originalDuration
      ) {
        // Resize by top edge
        const originalEnd = timeToPosition(
          dragState.originalStartTime.add(dragState.originalDuration, 'second'),
          startTime
        );
        const minDuration = SNAP_MINUTES * 60; // Minimum 5 minutes
        const newDuration = Math.max(
          ((originalEnd - snappedPosition) / TIME_SLOT_HEIGHT) * 60,
          minDuration
        );
        const snappedDuration = Math.round(newDuration / (SNAP_MINUTES * 60)) * (SNAP_MINUTES * 60);
        const newStartTime = dayjs(dragState.originalStartTime).add(
          dragState.originalDuration - snappedDuration,
          'second'
        );

        setDragState(prev =>
          prev
            ? {
                ...prev,
                originalStartTime: newStartTime,
                draggedPosition: timeToPosition(newStartTime, startTime),
                originalDuration: snappedDuration
              }
            : null
        );
      }
    },
    [dragState, startTime, endTime]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState) return;

    if (dragState.mode === 'create') {
      // Check if it was just a click (no movement) or a drag
      if (dragState.createStartPosition === dragState.createCurrentPosition) {
        // Just a click: create 1-hour event at click position
        const eventStart = positionToTime(dragState.createStartPosition, startTime);
        addAgendaEvent(eventStart, DEFAULT_EVENT_DURATION);
      } else if (
        dragState.createStartPosition !== undefined &&
        dragState.createCurrentPosition !== undefined
      ) {
        // Drag: create event with direction-agnostic logic
        const startPos = Math.min(dragState.createStartPosition, dragState.createCurrentPosition);
        const endPos = Math.max(dragState.createStartPosition, dragState.createCurrentPosition);

        const eventStart = positionToTime(startPos, startTime);
        const eventEnd = positionToTime(endPos, startTime);
        const duration = Math.round(eventEnd.diff(eventStart, 'second'));

        // Only create event if it's at least 5 minutes long
        if (duration >= MIN_CREATE_DURATION) {
          addAgendaEvent(eventStart, duration);
        }
      }
    } else if (dragState.mode === 'body' && dragState.blockId && dragState.originalStartTime) {
      // Update event position - draggedPosition is in document coordinates
      const newStartTime = positionToTime(dragState.draggedPosition, startTime);
      updateAgendaEvent(
        dragState.blockId,
        newStartTime,
        dragState.originalDuration || DEFAULT_EVENT_DURATION
      );
    } else if (
      dragState.mode === 'bottom-edge' &&
      dragState.blockId &&
      dragState.originalStartTime
    ) {
      // Update event end (duration)
      const eventStart = dragState.originalStartTime;
      const eventEnd = positionToTime(dragState.draggedPosition, startTime);
      const newDuration = Math.round(eventEnd.diff(eventStart, 'second'));
      updateAgendaEvent(dragState.blockId, eventStart, Math.max(newDuration, SNAP_MINUTES * 60));
    } else if (
      dragState.mode === 'top-edge' &&
      dragState.blockId &&
      dragState.originalStartTime &&
      dragState.originalDuration
    ) {
      // Update event start and duration
      updateAgendaEvent(dragState.blockId, dragState.originalStartTime, dragState.originalDuration);
    }

    setDragState(null);
  }, [dragState, startTime, addAgendaEvent, updateAgendaEvent]);

  const handleDragStartBody = useCallback(
    (block, blockStartY: number) => {
      const block_startTime = block.startTime;
      const block_duration = block.durationSeconds;

      // Get the position of the block in document coordinates (includes HEADER_HEIGHT)
      const blockPosition = timeToPosition(block_startTime, startTime);

      setDragState({
        mode: 'body',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block_startTime,
        originalDuration: block_duration,
        draggedPosition: blockPosition,
        dragStartPosition: blockPosition
      });
    },
    [startTime]
  );

  const handleDragStartTopEdge = useCallback(
    (block, blockStartY: number) => {
      const block_startTime = block.startTime;
      const block_duration = block.durationSeconds;

      const position = timeToPosition(block_startTime, startTime);
      setDragState({
        mode: 'top-edge',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block_startTime,
        originalDuration: block_duration,
        draggedPosition: position + HEADER_HEIGHT
      });
    },
    [startTime]
  );

  const handleDragStartBottomEdge = useCallback(
    (block, blockStartY: number) => {
      const block_startTime = block.startTime;
      const block_duration = block.durationSeconds;

      const endPosition = timeToPosition(block_startTime.add(block_duration, 'second'), startTime);
      setDragState({
        mode: 'bottom-edge',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block_startTime,
        originalDuration: block_duration,
        draggedPosition: endPosition + HEADER_HEIGHT
      });
    },
    [startTime]
  );

  // Set up event listeners
  useEffect(() => {
    if (dragState) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Preview box during drag-to-create
  const dragPreviewTop =
    dragState?.mode === 'create' &&
    dragState.createStartPosition !== undefined &&
    dragState.createCurrentPosition !== undefined
      ? Math.min(dragState.createStartPosition, dragState.createCurrentPosition) - HEADER_HEIGHT
      : undefined;
  const dragPreviewHeight =
    dragState?.mode === 'create' &&
    dragState.createStartPosition !== undefined &&
    dragState.createCurrentPosition !== undefined
      ? Math.abs(dragState.createCurrentPosition - dragState.createStartPosition)
      : undefined;

  return (
    <Stack width="33.33%" ref={columnRef} onMouseDown={handleMouseDown}>
      <Box
        sx={{
          height: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Typography variant="h6">{t('title')}</Typography>
      </Box>
      <Box
        sx={{
          position: 'relative',
          minHeight: '100%',
          userSelect: dragState ? 'none' : 'auto',
          cursor: dragState?.mode === 'create' ? 'crosshair' : 'default'
        }}
      >
        {/* Preview box for drag-to-create */}
        {dragState?.mode === 'create' && dragPreviewHeight && dragPreviewHeight > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: dragPreviewTop,
              left: 8,
              right: 8,
              height: dragPreviewHeight,
              backgroundColor: 'rgba(156, 39, 176, 0.3)',
              border: '2px dashed rgba(156, 39, 176, 0.6)',
              borderRadius: 1,
              pointerEvents: 'none',
              zIndex: 500
            }}
          />
        )}

        {agendaBlocks.map(block => {
          const isDraggingThisBlock =
            dragState &&
            (dragState.mode === 'body' ||
              dragState.mode === 'top-edge' ||
              dragState.mode === 'bottom-edge') &&
            dragState.blockId === block.id;
          const draggedPos =
            isDraggingThisBlock && dragState?.mode === 'body'
              ? dragState.draggedPosition - HEADER_HEIGHT
              : isDraggingThisBlock && dragState?.mode === 'top-edge'
                ? dragState.draggedPosition - HEADER_HEIGHT
                : isDraggingThisBlock && dragState?.mode === 'bottom-edge'
                  ? dragState.draggedPosition - HEADER_HEIGHT
                  : 0;

          return (
            <div key={block.id} data-agenda-block>
              <AgendaBlock
                block={block}
                startTime={startTime}
                isDraggingBody={dragState?.blockId === block.id && dragState.mode === 'body'}
                isDraggingEdge={
                  dragState?.blockId === block.id &&
                  (dragState.mode === 'top-edge' || dragState.mode === 'bottom-edge')
                }
                draggedPosition={draggedPos}
                draggedDuration={
                  isDraggingThisBlock &&
                  (dragState?.mode === 'bottom-edge' || dragState?.mode === 'top-edge')
                    ? dragState.originalDuration
                    : undefined
                }
                draggedStartTime={
                  isDraggingThisBlock && dragState?.mode === 'top-edge'
                    ? dragState.originalStartTime
                    : undefined
                }
                onDragStartBody={handleDragStartBody}
                onDragStartTopEdge={handleDragStartTopEdge}
                onDragStartBottomEdge={handleDragStartBottomEdge}
              />
            </div>
          );
        })}
      </Box>
    </Stack>
  );
};
