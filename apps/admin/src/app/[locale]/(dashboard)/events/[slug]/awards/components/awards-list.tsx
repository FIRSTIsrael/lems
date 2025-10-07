'use client';

import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Divider, alpha, useTheme } from '@mui/material';
import { useAwards } from './awards-context';
import { AwardItem } from './award-item';

export const AwardsList = () => {
  const theme = useTheme();
  const t = useTranslations('pages.events.awards.editor');
  const { awards, reorderAwards } = useAwards();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderAwards(result.source.index, result.destination.index);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {t('awards-list', { count: awards.length })}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="awards-list">
          {(provided, snapshot) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                minHeight: 200,
                backgroundColor: snapshot.isDraggingOver
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.2s ease-in-out'
              }}
            >
              {awards.map((award, index) => (
                <AwardItem key={award} award={award} index={index} />
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Paper>
  );
};
