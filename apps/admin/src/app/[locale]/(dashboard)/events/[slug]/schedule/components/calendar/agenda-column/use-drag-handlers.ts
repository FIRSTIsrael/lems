import { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);
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
        const mouseDelta = e.clientY - dragState.startY;
        const originalPosition = timeToPosition(dragState.originalStartTime, startTime);
        const newPosition = originalPosition + mouseDelta;
        const snappedPosition = snapToGrid(newPosition, startTime);

        const maxPosition = timeToPosition(
          endTime.subtract(dragState.originalDuration || DEFAULT_EVENT_DURATION, 'second'),
          startTime
        );
        const finalPosition = Math.min(Math.max(snappedPosition, HEADER_HEIGHT), maxPosition);

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
        const endTimePosition = timeToPosition(endTime, startTime);
        const newDuration = Math.max(
          ((snappedPosition - eventStart) / TIME_SLOT_HEIGHT) * 60,
          MIN_SNAP_DURATION
        );
        const snappedDuration = Math.round(newDuration / MIN_SNAP_DURATION) * MIN_SNAP_DURATION;
        
        // Ensure the end doesn't go past the column end time
        const proposedEnd = eventStart + (snappedDuration / 60) * TIME_SLOT_HEIGHT;
        const clampedEnd = Math.min(proposedEnd, endTimePosition);
        const finalDuration = Math.max(
          ((clampedEnd - eventStart) / TIME_SLOT_HEIGHT) * 60,
          MIN_SNAP_DURATION
        );

        onDragStateChange({
          ...dragState,
          draggedPosition: eventStart + (finalDuration / 60) * TIME_SLOT_HEIGHT,
          originalDuration: finalDuration
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
        const startTimePosition = timeToPosition(startTime, startTime);
        const newDuration = Math.max(
          ((originalEnd - snappedPosition) / TIME_SLOT_HEIGHT) * 60,
          MIN_SNAP_DURATION
        );
        const snappedDuration = Math.round(newDuration / MIN_SNAP_DURATION) * MIN_SNAP_DURATION;
        
        // Calculate new start time
        let newStartTime = dayjs(dragState.originalStartTime).add(
          dragState.originalDuration - snappedDuration,
          'second'
        );
        
        // Ensure the start doesn't go before the column start time
        let newStartPosition = timeToPosition(newStartTime, startTime);
        if (newStartPosition < startTimePosition) {
          newStartPosition = startTimePosition;
          newStartTime = startTime;
        }

        onDragStateChange({
          ...dragState,
          originalStartTime: newStartTime,
          draggedPosition: Math.min(newStartPosition + (snappedDuration / 60) * TIME_SLOT_HEIGHT, originalEnd),
          originalDuration: snappedDuration
        });
      }
    },
    [dragState, startTime, endTime, onDragStateChange]
  );

  const handleMouseUp = useCallback(
    (
      onAddEvent: (startTime: Dayjs, duration: number, title: string) => void,
      onUpdateEvent: (blockId: string, updates: Partial<AgendaBlock>) => void
    ) => {
      if (!dragState) return;

      if (dragState.mode === 'create') {
        if (dragState.createStartPosition === dragState.createCurrentPosition) {
          const eventStart = positionToTime(dragState.createStartPosition || 0, startTime);
          onAddEvent(eventStart, DEFAULT_EVENT_DURATION, t('default-event-title'));
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
            onAddEvent(eventStart, duration, t('default-event-title'));
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
    [dragState, onDragStateChange, startTime, t]
  );

  return { handleMouseMove, handleMouseUp };
};
