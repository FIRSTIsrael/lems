'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import { ScheduleBlock } from './calendar-types';
import { calculateBlockPosition } from './calendar-utils';

interface BreakIndicatorProps {
  topBlock: ScheduleBlock;
  bottomBlock?: ScheduleBlock;
  startTime: Dayjs;
  onAddBreak: (insertTime: Dayjs) => void;
}

export const BreakIndicator: React.FC<BreakIndicatorProps> = ({
  topBlock,
  bottomBlock,
  startTime,
  onAddBreak
}) => {
  const topPosition = calculateBlockPosition(startTime, topBlock.startTime, topBlock.endTime);
  const bottomPosition = bottomBlock
    ? calculateBlockPosition(startTime, bottomBlock.startTime, bottomBlock.endTime)
    : { top: topPosition.top + topPosition.height + 60, height: 0 }; // Default gap if no bottom block

  const gap = bottomPosition.top - (topPosition.top + topPosition.height);
  const centerY = topPosition.top + topPosition.height + gap / 2;

  // Only show indicator if there's enough gap (at least 20px)
  if (gap < 20) return null;

  const handleAddBreak = () => {
    onAddBreak(topBlock.endTime);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: centerY - 12,
        left: 8,
        right: 8,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        opacity: 0,
        transition: 'opacity 0.2s ease',
        '&:hover': {
          opacity: 1
        }
      }}
    >
      <Button
        size="small"
        variant="outlined"
        startIcon={<Add />}
        onClick={handleAddBreak}
        sx={{
          minWidth: 'auto',
          px: 1,
          py: 0.25,
          fontSize: '0.75rem',
          backgroundColor: 'white',
          borderColor: 'divider',
          color: 'text.secondary',
          '&:hover': {
            backgroundColor: 'grey.50',
            borderColor: 'primary.main',
            color: 'primary.main'
          }
        }}
      >
        Add Break
      </Button>
    </Box>
  );
};
