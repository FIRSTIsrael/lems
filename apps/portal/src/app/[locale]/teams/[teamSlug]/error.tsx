'use client';

import Link from 'next/link';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

export default function TeamError() {
  const t = useTranslations('pages.team');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="text.secondary">
            {t('not-found.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('not-found.description')}
          </Typography>
          <Button component={Link} href="/teams" variant="outlined" startIcon={<LocationIcon />}>
            {t('not-found.back-to-teams')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
