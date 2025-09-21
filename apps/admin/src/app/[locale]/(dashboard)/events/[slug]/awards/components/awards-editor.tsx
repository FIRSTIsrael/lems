'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Undo as UndoIcon } from '@mui/icons-material';
import { OPTIONAL_AWARDS } from '@lems/types/fll';
import { useAwards } from '../context';
import { AwardItem } from './award-item';
import { AddAwardDialog } from './add-award-dialog';

export function AwardsEditor() {
  const theme = useTheme();
  const t = useTranslations('pages.events.awards.editor');
  const { awards, reorderAwards, addAward, saveSchema, resetChanges, isLoading, isDirty } =
    useAwards();

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Get awards that can be added (not already in the list)
  const availableAwards = OPTIONAL_AWARDS.filter(award => !awards.includes(award));

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderAwards(result.source.index, result.destination.index);
  };

  const handleSave = async () => {
    try {
      await saveSchema();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  console.log([...awards]);

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {t('title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('subtitle')}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
              disabled={availableAwards.length === 0}
            >
              {t('add-award')}
            </Button>

            {isDirty && (
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                onClick={resetChanges}
                color="warning"
              >
                {t('cancel-changes')}
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={!isDirty || isLoading}
            >
              {isLoading ? t('saving') : t('save-changes')}
            </Button>
          </Stack>
        </Stack>

        {isDirty && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Chip label={t('unsaved-changes')} color="warning" variant="outlined" size="small" />
              <Typography variant="body2" color="text.secondary">
                {t('unsaved-warning')}
              </Typography>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Awards List */}
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

      <AddAwardDialog
        open={addDialogOpen}
        options={availableAwards}
        onAdd={addAward}
        onClose={() => setAddDialogOpen(false)}
      />
    </Box>
  );
}
