'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Button, Stack, Chip, alpha, useTheme } from '@mui/material';
import { Add as AddIcon, Save as SaveIcon, Undo as UndoIcon } from '@mui/icons-material';
import { OPTIONAL_AWARDS } from '@lems/types/fll';
import { useAwards } from './awards-context';
import { AddAwardDialog } from './add-award-dialog';

export const AwardsHeader = () => {
  const theme = useTheme();
  const t = useTranslations('pages.events.awards.editor');
  const { awards, addAward, saveSchema, resetChanges, isLoading, isDirty } = useAwards();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const availableAwards = OPTIONAL_AWARDS.filter(award => !awards.includes(award));

  return (
    <>
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
              onClick={saveSchema}
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

      <AddAwardDialog
        open={addDialogOpen}
        options={availableAwards}
        onAdd={addAward}
        onClose={() => setAddDialogOpen(false)}
      />
    </>
  );
};
