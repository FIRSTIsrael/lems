'use client';

import { Paper, Typography, Button, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';

interface NoConfigurationProps {
  onCreateConfig: () => void;
}

export function NoConfiguration({ onCreateConfig }: NoConfigurationProps) {
  const t = useTranslations('pages.events.practice-tables.no-config');

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={3} sx={{ alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('description')}
        </Typography>
        <Button variant="contained" onClick={onCreateConfig}>
          {t('create-button')}
        </Button>
      </Stack>
    </Paper>
  );
}
