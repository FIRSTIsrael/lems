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

  const { blocks } = useCalendar();
  const columnBlocks = blocks.filter(block => block.column === name);

  return (
    <Stack width="50%">
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
      <Box sx={{ position: 'relative', minHeight: '100%' }}>
        {columnBlocks.map(block => {
          const nonBreakBlocks = columnBlocks.filter(b => b.type !== 'break');
          const isFirstBlock = nonBreakBlocks.length > 0 && nonBreakBlocks[0].id === block.id;

          return (
            <ScheduleBlockComponent
              key={block.id}
              block={block}
              isFirstBlock={isFirstBlock}
              onDragStart={handleDragStart}
            />
          );
        })}
      </Box>
    </Stack>
  );
};
