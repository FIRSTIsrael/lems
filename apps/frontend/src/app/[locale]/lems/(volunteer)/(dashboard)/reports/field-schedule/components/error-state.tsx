'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

export function ErrorState() {
  const t = useTranslations('pages.reports.field-schedule');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {t('error-loading')}
      </Typography>
    </Box>
  );
}
