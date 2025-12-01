'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack } from '@mui/material';
import { AgendaBlock, HEADER_HEIGHT } from '../calendar-types';
import { snapToGrid } from '../drag-utils';
import { useCalendar } from '../calendar-context';
import { AgendaBlockComponent } from '../agenda-block/agenda-block';
import { AgendaDragState } from './drag-types';
import { useDragHandlers } from './use-drag-handlers';
import { useDragStart } from './use-drag-start';

interface AgendaColumnProps {
  startTime: Dayjs;
  endTime: Dayjs;
}

export const AgendaColumn: React.FC<AgendaColumnProps> = ({ startTime, endTime }) => {
  const t = useTranslations(`pages.events.schedule.calendar.agenda`);

  const { blocks, addAgendaEvent, updateAgendaEvent, editingBlockId } = useCalendar();
  const agendaBlocks = blocks.agenda;

  const [dragState, setDragState] = useState<AgendaDragState | null>(null);
  const columnRef = useRef<HTMLDivElement>(null);

  const { handleMouseMove, handleMouseUp } = useDragHandlers({
    dragState,
    startTime,
    endTime,
    onDragStateChange: setDragState
  });

  const { handleDragStartBody, handleDragStartTopEdge, handleDragStartBottomEdge } = useDragStart({
    startTime,
    onDragStateChange: setDragState
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Don't create events when a dialog is open
      if (editingBlockId) {
        return;
      }

      if (e.button !== 0 || !columnRef.current) return;

      const rect = columnRef.current.getBoundingClientRect();
      const yPos = e.clientY - rect.top;

      if ((e.target as HTMLElement).closest('[data-agenda-block]')) {
        return;
      }

      const snappedStartPosition = snapToGrid(yPos, startTime);
      setDragState({
        mode: 'create',
        startY: e.clientY,
        draggedPosition: snappedStartPosition,
        createStartPosition: snappedStartPosition,
        createCurrentPosition: snappedStartPosition
      });
    },
    [startTime, editingBlockId]
  );

  useEffect(() => {
    if (dragState && columnRef.current && !editingBlockId) {
      const handleMove = (e: MouseEvent) => {
        const rect = columnRef.current?.getBoundingClientRect();
        if (rect) {
          handleMouseMove(e, rect);
        }
      };

      const handleUp = () => {
        handleMouseUp(addAgendaEvent, updateAgendaEvent);
      };

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [
    dragState,
    handleMouseMove,
    handleMouseUp,
    addAgendaEvent,
    updateAgendaEvent,
    editingBlockId
  ]);

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
        {dragState?.mode === 'create' && (
          <Box
            display={dragPreviewHeight ? 'block' : 'none'}
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
              <AgendaBlockComponent
                block={block as AgendaBlock}
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
