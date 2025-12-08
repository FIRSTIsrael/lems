'use client';

import { useTranslations } from 'next-intl';
import { Box, CircularProgress, Typography } from '@mui/material';

export function LoadingState() {
  const t = useTranslations('pages.reports.judging-schedule');

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6, gap: 2 }}>
      <CircularProgress size={24} />
      <Typography variant="body1" color="text.secondary">
        {t('loading')}
      </Typography>
    </Box>
  );
}
