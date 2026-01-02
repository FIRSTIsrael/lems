'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import { PlayArrow, Lock } from '@mui/icons-material';
import { useCategoryDeliberation } from '../deliberation-context';

export function ControlsPanel() {
  const theme = useTheme();
  const t = useTranslations('pages.deliberations.category.controls');
  const { deliberation, startDeliberation } = useCategoryDeliberation();

  const handleStartDeliberation = useCallback(async () => {
    await startDeliberation();
  }, [startDeliberation]);

  const isInProgress = deliberation?.status === 'in-progress';

  return (
    <Box
      sx={{
        p: 1.75,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        borderRadius: 1
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.75 }}>
        {t('status')}
      </Typography>
      <Typography variant="caption" sx={{ display: 'block', mb: 1.5, opacity: 0.9 }}>
        {deliberation?.status === 'in-progress' ? t('in-progress') : t('not-started')}
      </Typography>

      {!isInProgress ? (
        <Button
          variant="contained"
          fullWidth
          startIcon={<PlayArrow />}
          onClick={handleStartDeliberation}
          size="small"
          sx={{
            bgcolor: '#fff',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: alpha('#fff', 0.9)
            },
            fontWeight: 600
          }}
        >
          {t('start')}
        </Button>
      ) : (
        <Button
          variant="contained"
          fullWidth
          startIcon={<Lock />}
          size="small"
          sx={{
            bgcolor: '#fff',
            color: theme.palette.primary.main,
            '&:hover': {
              bgcolor: alpha('#fff', 0.9)
            },
            fontWeight: 600
          }}
        >
          {t('lock')}
        </Button>
      )}
    </Box>
  );
}
