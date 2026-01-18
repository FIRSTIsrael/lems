'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import { EmojiEvents } from '@mui/icons-material';

export function EmptyState() {
  const t = useTranslations('pages.reports.scoreboard');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <EmojiEvents sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {t('no-data')}
      </Typography>
    </Box>
  );
}
