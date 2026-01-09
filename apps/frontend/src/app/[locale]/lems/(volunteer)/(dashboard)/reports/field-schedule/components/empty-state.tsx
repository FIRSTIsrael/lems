'use client';

import { useTranslations } from 'next-intl';
import { Box, Typography } from '@mui/material';
import { EventNoteOutlined } from '@mui/icons-material';

export function EmptyState() {
  const t = useTranslations('pages.reports.field-schedule');

  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <EventNoteOutlined sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {t('empty-state')}
      </Typography>
    </Box>
  );
}
