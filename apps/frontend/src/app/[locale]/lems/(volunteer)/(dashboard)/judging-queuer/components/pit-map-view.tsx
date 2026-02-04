'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';

export function PitMapView() {
  const t = useTranslations('pages.judging-queuer.pit-map');

  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <MapIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography variant="h6" color="text.secondary">
          {t('title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('description')}
        </Typography>
      </Stack>
    </Paper>
  );
}
