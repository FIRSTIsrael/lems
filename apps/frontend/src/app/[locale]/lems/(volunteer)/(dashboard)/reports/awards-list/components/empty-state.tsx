'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';

export function EmptyState() {
  const t = useTranslations('pages.reports.awards-list');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h6" color="text.secondary">
        {t('no-awards')}
      </Typography>
    </Box>
  );
}
