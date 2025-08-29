'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { ScheduleBlock, HEADER_HEIGHT, DragState } from './calendar-types';
import { ScheduleBlockComponent } from './schedule-block';

interface CalendarColumnProps {
  title: string;
  blocks: ScheduleBlock[];
  handleDragStart: (block: ScheduleBlock, startY: number) => void;
  handleDeleteBlock: (blockId: string) => void;
  dragState: DragState;
}

export const CalendarColumn: React.FC<CalendarColumnProps> = ({
  title,
  blocks,
  handleDragStart,
  handleDeleteBlock,
  dragState
}) => {
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
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Box sx={{ position: 'relative', minHeight: '100%' }}>
        {blocks.map(block => {
          const nonBreakBlocks = blocks.filter(b => b.type !== 'break');
          const isFirstBlock = nonBreakBlocks.length > 0 && nonBreakBlocks[0].id === block.id;

          return (
            <ScheduleBlockComponent
              key={block.id}
              block={block}
              onDragStart={handleDragStart}
              onDelete={handleDeleteBlock}
              isDragging={dragState.isDragging && dragState.draggedBlock?.id === block.id}
              dragPosition={dragState.draggedPosition}
              isFirstBlock={isFirstBlock}
            />
          );
        })}
      </Box>
    </Stack>
  );
};
