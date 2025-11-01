'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';

export default function EventError() {
  const t = useTranslations('pages.event.not-found');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="text.secondary">
            {t('title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('description')}
          </Typography>
          <Button component={Link} href="/events" variant="outlined" startIcon={<EventIcon />}>
            {t('back-to-events')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
