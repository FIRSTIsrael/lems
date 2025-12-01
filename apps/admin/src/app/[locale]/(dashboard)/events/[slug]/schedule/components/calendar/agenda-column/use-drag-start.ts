import { useCallback } from 'react';
import { Dayjs } from 'dayjs';
import { HEADER_HEIGHT } from '../calendar-types';
import { timeToPosition } from '../drag-utils';
import { AgendaDragState } from './drag-types';

interface ScheduleBlock {
  id: string;
  startTime: Dayjs;
  durationSeconds: number;
}

interface UseDragStartProps {
  startTime: Dayjs;
  onDragStateChange: (state: AgendaDragState) => void;
}

export const useDragStart = ({ startTime, onDragStateChange }: UseDragStartProps) => {
  const handleDragStartBody = useCallback(
    (block: ScheduleBlock, blockStartY: number) => {
      const blockPosition = timeToPosition(block.startTime, startTime);

      onDragStateChange({
        mode: 'body',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block.startTime,
        originalDuration: block.durationSeconds,
        draggedPosition: blockPosition,
        dragStartPosition: blockPosition
      });
    },
    [startTime, onDragStateChange]
  );

  const handleDragStartTopEdge = useCallback(
    (block: ScheduleBlock, blockStartY: number) => {
      const position = timeToPosition(block.startTime, startTime);
      onDragStateChange({
        mode: 'top-edge',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block.startTime,
        originalDuration: block.durationSeconds,
        draggedPosition: position + HEADER_HEIGHT
      });
    },
    [startTime, onDragStateChange]
  );

  const handleDragStartBottomEdge = useCallback(
    (block: ScheduleBlock, blockStartY: number) => {
      const endPosition = timeToPosition(
        block.startTime.add(block.durationSeconds, 'second'),
        startTime
      );
      onDragStateChange({
        mode: 'bottom-edge',
        blockId: block.id,
        startY: blockStartY,
        originalStartTime: block.startTime,
        originalDuration: block.durationSeconds,
        draggedPosition: endPosition + HEADER_HEIGHT
      });
    },
    [startTime, onDragStateChange]
  );

  return {
    handleDragStartBody,
    handleDragStartTopEdge,
    handleDragStartBottomEdge
  };
};
