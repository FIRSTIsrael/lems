import { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { AgendaBlock, HEADER_HEIGHT, TIME_SLOT_HEIGHT } from '../calendar-types';
import { snapToGrid, timeToPosition, positionToTime, MIN_SNAP_DURATION } from '../drag-utils';
import {
  AgendaDragState,
  DEFAULT_EVENT_DURATION,
  MIN_CREATE_DURATION
} from './drag-types';

interface UseDragHandlersProps {
  dragState: AgendaDragState | null;
  startTime: Dayjs;
  endTime: Dayjs;
  onDragStateChange: (state: AgendaDragState | null) => void;
}

export const useDragHandlers = ({
  dragState,
  startTime,
  endTime,
  onDragStateChange
}: UseDragHandlersProps) => {
  const handleMouseMove = useCallback(
    (e: MouseEvent, columnRect: DOMRect) => {
      if (!dragState) return;

      const yPos = e.clientY - columnRect.top;
      const snappedPosition = snapToGrid(yPos, startTime);

      if (dragState.mode === 'create') {
        onDragStateChange({
          ...dragState,
          createCurrentPosition: snappedPosition
        });
      } else if (
        dragState.mode === 'body' &&
        dragState.blockId &&
        dragState.originalStartTime &&
        dragState.dragStartPosition !== undefined
      ) {
        const currentPosition = snapToGrid(yPos, startTime);
        const dragStartPos = dragState.dragStartPosition;
        const positionDelta = currentPosition - dragStartPos;

        const originalPosition = timeToPosition(dragState.originalStartTime, startTime);
        const newPosition = originalPosition + positionDelta;

        const maxPosition = timeToPosition(
          endTime.subtract(dragState.originalDuration || DEFAULT_EVENT_DURATION, 'second'),
          startTime
        );
        const finalPosition = Math.min(Math.max(newPosition, HEADER_HEIGHT), maxPosition);

        onDragStateChange({
          ...dragState,
          draggedPosition: finalPosition
        });
      } else if (
        dragState.mode === 'bottom-edge' &&
        dragState.blockId &&
        dragState.originalStartTime
      ) {
        const eventStart = timeToPosition(dragState.originalStartTime, startTime);
        const newDuration = Math.max(
          ((snappedPosition - eventStart) / TIME_SLOT_HEIGHT) * 60,
          MIN_SNAP_DURATION
        );
        const snappedDuration = Math.round(newDuration / MIN_SNAP_DURATION) * MIN_SNAP_DURATION;

        onDragStateChange({
          ...dragState,
          draggedPosition: eventStart + (snappedDuration / 60) * TIME_SLOT_HEIGHT,
          originalDuration: snappedDuration
        });
      } else if (
        dragState.mode === 'top-edge' &&
        dragState.blockId &&
        dragState.originalStartTime &&
        dragState.originalDuration
      ) {
        const originalEnd = timeToPosition(
          dragState.originalStartTime.add(dragState.originalDuration, 'second'),
          startTime
        );
        const newDuration = Math.max(
          ((originalEnd - snappedPosition) / TIME_SLOT_HEIGHT) * 60,
          MIN_SNAP_DURATION
        );
        const snappedDuration = Math.round(newDuration / MIN_SNAP_DURATION) * MIN_SNAP_DURATION;
        const newStartTime = dayjs(dragState.originalStartTime).add(
          dragState.originalDuration - snappedDuration,
          'second'
        );

        onDragStateChange({
          ...dragState,
          originalStartTime: newStartTime,
          draggedPosition: timeToPosition(newStartTime, startTime),
          originalDuration: snappedDuration
        });
      }
    },
    [dragState, startTime, endTime, onDragStateChange]
  );

  const handleMouseUp = useCallback(
    (
      onAddEvent: (startTime: Dayjs, duration: number) => void,
      onUpdateEvent: (blockId: string, updates: Partial<AgendaBlock>) => void
    ) => {
      if (!dragState) return;

      if (dragState.mode === 'create') {
        if (dragState.createStartPosition === dragState.createCurrentPosition) {
          const eventStart = positionToTime(dragState.createStartPosition || 0, startTime);
          onAddEvent(eventStart, DEFAULT_EVENT_DURATION);
        } else if (
          dragState.createStartPosition !== undefined &&
          dragState.createCurrentPosition !== undefined
        ) {
          const startPos = Math.min(dragState.createStartPosition, dragState.createCurrentPosition);
          const endPos = Math.max(dragState.createStartPosition, dragState.createCurrentPosition);

          const eventStart = positionToTime(startPos, startTime);
          const eventEnd = positionToTime(endPos, startTime);
          const duration = Math.round(eventEnd.diff(eventStart, 'second'));

          if (duration >= MIN_CREATE_DURATION) {
            onAddEvent(eventStart, duration);
          }
        }
      } else if (dragState.mode === 'body' && dragState.blockId && dragState.originalStartTime) {
        const newStartTime = positionToTime(dragState.draggedPosition, startTime);
        onUpdateEvent(
          dragState.blockId,
          {
            startTime: newStartTime,
            durationSeconds: dragState.originalDuration || DEFAULT_EVENT_DURATION
          }
        );
      } else if (
        dragState.mode === 'bottom-edge' &&
        dragState.blockId &&
        dragState.originalStartTime
      ) {
        const eventStart = dragState.originalStartTime;
        const eventEnd = positionToTime(dragState.draggedPosition, startTime);
        const newDuration = Math.round(eventEnd.diff(eventStart, 'second'));
        onUpdateEvent(dragState.blockId, {startTime: eventStart, durationSeconds: Math.max(newDuration, MIN_SNAP_DURATION)});
      } else if (
        dragState.mode === 'top-edge' &&
        dragState.blockId &&
        dragState.originalStartTime &&
        dragState.originalDuration
      ) {
        onUpdateEvent(dragState.blockId, {
          startTime: dragState.originalStartTime, 
          durationSeconds: dragState.originalDuration
        });
      }

      onDragStateChange(null);
    },
    [dragState, startTime, onDragStateChange]
  );

  return { handleMouseMove, handleMouseUp };
};
