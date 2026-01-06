'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography, CircularProgress } from '@mui/material';

export function LoadingState() {
  const t = useTranslations('pages.reports.field-schedule');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <CircularProgress sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {t('loading')}
      </Typography>
    </Box>
  );
}
