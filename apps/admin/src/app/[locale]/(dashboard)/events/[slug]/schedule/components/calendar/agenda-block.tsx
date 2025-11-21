'use client';

import React from 'react';
import { Dayjs } from 'dayjs';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { ScheduleBlock, BLOCK_COLORS, HEADER_HEIGHT } from './calendar-types';
import { calculateBlockPosition } from './calendar-utils';
import { useCalendar } from './calendar-context';

interface AgendaBlockProps {
  block: ScheduleBlock;
  startTime: Dayjs;
  isDraggingBody: boolean;
  isDraggingEdge: boolean;
  draggedPosition: number;
  draggedDuration?: number; // For bottom-edge resize preview
  draggedStartTime?: Dayjs; // For top-edge resize preview
  onDragStartBody: (block: ScheduleBlock, startY: number) => void;
  onDragStartTopEdge: (block: ScheduleBlock, startY: number) => void;
  onDragStartBottomEdge: (block: ScheduleBlock, startY: number) => void;
}

export const AgendaBlock: React.FC<AgendaBlockProps> = ({
  block,
  startTime,
  isDraggingBody,
  isDraggingEdge,
  draggedPosition,
  draggedDuration,
  draggedStartTime,
  onDragStartBody,
  onDragStartTopEdge,
  onDragStartBottomEdge
}) => {
  const { deleteAgendaEvent } = useCalendar();

  const position = calculateBlockPosition(startTime, block);

  // For edge resizing, use dragged values; otherwise use original block values
  const displayStartTime = draggedStartTime || block.startTime;
  const displayDuration = draggedDuration || block.durationSeconds;
  const displayPosition = calculateBlockPosition(startTime, {
    ...block,
    startTime: displayStartTime,
    durationSeconds: displayDuration
  });

  const finalTop = isDraggingEdge
    ? displayPosition.top
    : isDraggingBody
      ? draggedPosition - HEADER_HEIGHT
      : position.top;
  const finalHeight = isDraggingEdge ? displayPosition.height : position.height;

  const handleMouseDownBody = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingEdge) {
      e.stopPropagation();
      onDragStartBody(block, e.clientY);
    }
  };

  const handleMouseDownTopEdge = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      onDragStartTopEdge(block, e.clientY);
    }
  };

  const handleMouseDownBottomEdge = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.stopPropagation();
      onDragStartBottomEdge(block, e.clientY);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAgendaEvent(block.id);
  };

  const formatTime = (time: Dayjs) => time.format('HH:mm');

  return (
    <Box
      sx={{
        position: 'absolute',
        top: finalTop,
        left: 8,
        right: 8,
        height: finalHeight,
        backgroundColor: BLOCK_COLORS[block.type],
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 1,
        cursor: isDraggingBody ? 'grabbing' : 'grab',
        zIndex: isDraggingBody || isDraggingEdge ? 1000 : 1,
        opacity: isDraggingBody || isDraggingEdge ? 0.9 : 1,
        boxShadow:
          isDraggingBody || isDraggingEdge
            ? '0 8px 16px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.1)',
        transition: isDraggingBody || isDraggingEdge ? 'none' : 'all 0.2s ease',
        transform: isDraggingBody || isDraggingEdge ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1,
        px: 1,
        '&:hover': {
          boxShadow:
            isDraggingBody || isDraggingEdge
              ? '0 8px 16px rgba(0,0,0,0.3)'
              : '0 2px 6px rgba(0,0,0,0.2)',
          transform: isDraggingBody || isDraggingEdge ? 'scale(1.02)' : 'scale(1.01)',
          '& .delete-button': {
            opacity: 1
          }
        }
      }}
      onMouseDown={handleMouseDownBody}
    >
      {/* Top edge resize handle */}
      <Box
        onMouseDown={handleMouseDownTopEdge}
        sx={{
          position: 'absolute',
          top: -4,
          left: 0,
          right: 0,
          height: 8,
          cursor: 'ns-resize',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        }}
      />

      {/* Bottom edge resize handle */}
      <Box
        onMouseDown={handleMouseDownBottomEdge}
        sx={{
          position: 'absolute',
          bottom: -4,
          left: 0,
          right: 0,
          height: 8,
          cursor: 'ns-resize',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.2)'
          }
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              lineHeight: 1.2
            }}
          >
            Event Title
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.625rem',
              lineHeight: 1
            }}
          >
            {formatTime(block.startTime)} -{' '}
            {formatTime(block.startTime.clone().add(block.durationSeconds, 'second'))}
          </Typography>
        </Box>

        <IconButton
          className="delete-button"
          size="small"
          onClick={handleDelete}
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
            color: 'white',
            p: 0.25,
            ml: 0.5,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};
