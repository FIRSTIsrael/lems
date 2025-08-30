'use client';

import React, { useCallback, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { useEvent } from '../../../components/event-context';
import { useSchedule } from '../schedule-context';
import { ScheduleBlock, BLOCK_COLORS, HEADER_HEIGHT } from './calendar-types';
import { calculateBlockPosition } from './calendar-utils';
import { useCalendar } from './calendar-context';

interface ScheduleBlockComponentProps {
  block: ScheduleBlock;
  index: number;
  onDragStart: (block: ScheduleBlock, startY: number) => void;
}

export const ScheduleBlockComponent: React.FC<ScheduleBlockComponentProps> = ({
  block,
  index,
  onDragStart
}) => {
  const t = useTranslations('pages.events.schedule.calendar');

  const event = useEvent();
  const startTime = dayjs(event.startDate).hour(6).minute(0).second(0);

  const { practiceRounds } = useSchedule();
  const { dragState } = useCalendar();

  const isDragging = dragState.isDragging && dragState.draggedBlock?.id === block.id;
  const dragPosition = dragState.draggedPosition;

  const blockNumber = useMemo(() => {
    let _number = index;
    if (block.type === 'ranking-round') {
      _number -= practiceRounds;
    }
    return _number;
  }, [block.type, index, practiceRounds]);
  const canDelete = block.type !== 'judging-session' && blockNumber !== 0;

  const size = useMemo(() => {
    if (block.durationSeconds > 600) return 'normal';
    if (block.durationSeconds > 300) return 'small';
    return 'tiny';
  }, [block.durationSeconds]);

  const position = calculateBlockPosition(startTime, block);
  const finalTop =
    isDragging && dragPosition !== undefined ? dragPosition - HEADER_HEIGHT : position.top;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click only
      onDragStart(block, e.clientY);
    }
  };

  // const handleDelete = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.stopPropagation();

  //     // Prevent deletion of judging sessions
  //     if (block.type === 'judging-session') {
  //       console.warn('Judging sessions cannot be deleted');
  //       return;
  //     }

  //     if (block.type === 'practice-round') {
  //       // Simply remove the practice round and merge breaks, then renumber
  //       setBlocks(prev => {
  //         let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, block.id);
  //         blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
  //         return blocksAfterRemoval;
  //       });
  //       removePracticeRound();
  //     } else if (block.type === 'ranking-round') {
  //       // Simply remove the ranking round and merge breaks, then renumber
  //       setBlocks(prev => {
  //         let blocksAfterRemoval = deleteBlockAndMergeBreaks(prev, block.id);
  //         blocksAfterRemoval = renumberRounds(blocksAfterRemoval);
  //         return blocksAfterRemoval;
  //       });

  //       removeRankingRound();
  //     }
  //   },
  //   [block, removePracticeRound, removeRankingRound, setBlocks]
  // );

  const handleDelete = () => {};

  const formatTime = (time: Dayjs) => time.format('HH:mm');

  const getBlockTitle = useCallback(
    (block: ScheduleBlock) => {
      return t(`blocks.${block.type}`, { number: blockNumber + 1 });
    },
    [blockNumber, t]
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: finalTop,
        left: 8,
        right: 8,
        height: position.height,
        backgroundColor: BLOCK_COLORS[block.type],
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.9 : 1,
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: size === 'tiny' ? 0.2 : 1,
        px: 1,
        '&:hover': {
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
        <Stack
          direction={size === 'normal' ? 'column' : 'row'}
          spacing={size === 'normal' ? 0.5 : 2}
        >
          <Typography
            variant="body2"
            sx={{
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              lineHeight: size === 'tiny' ? 1 : 1.2,
              flex: 1
            }}
          >
            {getBlockTitle(block)}
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
        </Stack>

        {canDelete && (
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
    </Box>
  );
};
