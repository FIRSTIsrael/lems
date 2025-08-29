'use client';

import React, { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Typography, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useEvent } from '../../../components/event-context';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, BLOCK_COLORS, HEADER_HEIGHT } from './calendar-types';
import {
  calculateBlockPosition,
  deleteBlockAndMergeBreaks,
  removeBreak,
  renumberRounds
} from './calendar-utils';
import { useCalendar } from './calendar-context';

interface ScheduleBlockComponentProps {
  block: ScheduleBlock;
  onDragStart: (block: ScheduleBlock, startY: number) => void;
  isFirstBlock?: boolean;
}

export const ScheduleBlockComponent: React.FC<ScheduleBlockComponentProps> = ({
  block,
  onDragStart,
  isFirstBlock = false
}) => {
  const { removePracticeRound, removeRankingRound } = useSchedule();
  const { dragState, setBlocks } = useCalendar();

  const isDragging = dragState.isDragging && dragState.draggedBlock?.id === block.id;
  const dragPosition = dragState.draggedPosition;

  // Start time of the event
  const event = useEvent();
  const startTime = dayjs(event.startDate).hour(6).minute(0).second(0);

  const position = calculateBlockPosition(startTime, block.startTime, block.endTime);
  // When dragging, use dragPosition but subtract header height since dragPosition includes it
  const finalTop =
    isDragging && dragPosition !== undefined ? dragPosition - HEADER_HEIGHT : position.top;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Breaks cannot be dragged
    if (block.type === 'break') return;

    if (e.button === 0) {
      // Left click only
      onDragStart(block, e.clientY);
    }
  };

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // Prevent deletion of judging sessions
      if (block.type === 'judging-session') {
        console.warn('Judging sessions cannot be deleted');
        return;
      }

      if (block.type === 'break') {
        // For breaks, just remove them without merging
        setBlocks(prev => removeBreak(prev, block.id));
      } else if (block.type === 'practice-round') {
        // Simply remove the practice round and merge breaks, then renumber
        setBlocks(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, block.id);
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
          return blocksAfterRemoval;
        });
        removePracticeRound();
      } else if (block.type === 'ranking-round') {
        // Simply remove the ranking round and merge breaks, then renumber
        setBlocks(prev => {
          let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, block.id);
          blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
          return blocksAfterRemoval;
        });

        removeRankingRound();
      }
    },
    [block, removePracticeRound, removeRankingRound, setBlocks]
  );

  const formatTime = (time: Dayjs) => time.format('HH:mm');

  return (
    <Box
      sx={{
        position: 'absolute',
        top: finalTop,
        left: 8,
        right: 8,
        height: position.height,
        backgroundColor: BLOCK_COLORS[block.type],
        border: isFirstBlock ? '2px solid #1976d2' : '1px solid rgba(0,0,0,0.1)',
        borderRadius: 1,
        cursor: block.type === 'break' ? 'default' : isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
        opacity: block.type === 'break' ? 0.7 : isDragging ? 0.9 : 1,
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 1,
        minHeight: 40,
        '&:hover':
          block.type === 'break'
            ? {}
            : {
                boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.2)',
                transform: isDragging ? 'scale(1.02)' : 'scale(1.01)',
                '& .delete-button': {
                  opacity: 1
                }
              }
      }}
      onMouseDown={handleMouseDown}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            lineHeight: 1.2,
            flex: 1
          }}
        >
          {block.title}
        </Typography>
        {block.canDelete && (
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
        )}
      </Box>

      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: '0.625rem',
          lineHeight: 1
        }}
      >
        {formatTime(block.startTime)} - {formatTime(block.endTime)}
      </Typography>
    </Box>
  );
};
