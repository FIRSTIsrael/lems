'use client';

import { useTranslations } from 'next-intl';
import { Alert, Typography } from '@mui/material';

export function ErrorState() {
  const t = useTranslations('pages.reports.awards-list');

  return (
    <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
      <Typography variant="body2" color="error.dark">
        {t('error-loading')}
      </Typography>
    </Alert>
  );
}
