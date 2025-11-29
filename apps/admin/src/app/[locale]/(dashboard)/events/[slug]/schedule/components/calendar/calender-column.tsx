'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Stack } from '@mui/material';
import { ScheduleBlock, HEADER_HEIGHT, ScheduleColumn } from './calendar-types';
import { ScheduleBlockComponent } from './schedule-block';
import { useCalendar } from './calendar-context';

interface CalendarColumnProps {
  name: ScheduleColumn;
  handleDragStart: (block: ScheduleBlock, startY: number) => void;
}

export const CalendarColumn: React.FC<CalendarColumnProps> = ({ name, handleDragStart }) => {
  const t = useTranslations(`pages.events.schedule.calendar.${name}`);

  const { blocks, isDisabled } = useCalendar();
  const columnBlocks = blocks[name];

  return (
    <Stack width="33.33%" sx={{ opacity: isDisabled ? 0.6 : 1, position: 'relative' }}>
      <Box
        sx={{
          height: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isDisabled ? 'action.disabledBackground' : 'grey.100',
          borderColor: 'divider',
          flexShrink: 0
        }}
      >
        <Typography variant="h6">{t('title')}</Typography>
      </Box>
      {isDisabled && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'transparent',
            zIndex: 100,
            cursor: 'not-allowed'
          }}
        />
      )}
      <Box sx={{ position: 'relative', minHeight: '100%' }}>
        {columnBlocks.map((block, index) => {
          return (
            <ScheduleBlockComponent
              key={block.id}
              block={block}
              index={index}
              onDragStart={handleDragStart}
              isDisabled={isDisabled}
            />
          );
        })}
      </Box>
    </Stack>
  );
};
