'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import { Gavel } from '@mui/icons-material';

export function EmptyState() {
  const t = useTranslations('pages.reports.judging-schedule');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Gavel sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {t('no-sessions')}
      </Typography>
    </Box>
  );
}
