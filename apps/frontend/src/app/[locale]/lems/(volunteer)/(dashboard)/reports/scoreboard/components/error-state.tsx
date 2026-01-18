'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

export function ErrorState() {
  const t = useTranslations('pages.reports.scoreboard');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="error.main">
        {t('error-loading')}
      </Typography>
    </Box>
  );
}
