'use client';

import { Box, Typography, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';

export function NoTeams() {
  const t = useTranslations('pages.practice-tables-manager');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('page-title')}
      </Typography>
      <Alert severity="info" sx={{ mt: 3 }}>
        {t('no-teams.title')}
      </Alert>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {t('no-teams.description')}
      </Typography>
    </Box>
  );
}
