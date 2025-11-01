'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';

export default function TeamInEventError() {
  const t = useTranslations('pages.team-in-event');

  const params = useParams();
  const eventSlug = params.slug as string;
  const teamNumber =
    params.number && typeof params.number === 'string' ? parseInt(params.number, 10) : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom color="text.secondary">
            {t('not-found.title', { number: teamNumber || 'Unknown' })}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('not-found.description')}
          </Typography>
          <Button
            component={Link}
            href={`/event/${eventSlug}`}
            variant="outlined"
            startIcon={<DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />}
          >
            {t('not-found.back-to-event')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
