'use client';

import { Container, Box, Alert } from '@mui/material';
import { useTranslations } from 'next-intl';

export function ErrorState() {
  const t = useTranslations('pages.reports.field-timer');

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{t('error-loading')}</Alert>
      </Box>
    </Container>
  );
}
