'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';

export function LoadingState() {
  const t = useTranslations('pages.reports.scoreboard');

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography color="text.secondary">{t('loading')}</Typography>
    </Box>
  );
}
