'use client';

import { Container, Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export function LoadingState() {
  const t = useTranslations('pages.reports.field-timer');

  return (
    <Container maxWidth="xl">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        <Typography variant="h4" color="text.secondary">
          {t('loading')}
        </Typography>
      </Box>
    </Container>
  );
}
