'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { TeamSummary } from '@lems/types/api/portal';
import { TeamHeader } from './components/team-header';
import { TeamResults } from './components/team-results';
import { TeamContents } from './components/team-contents';
import { TeamProvider } from './components/team-context';

export default function TeamPage() {
  const params = useParams();
  const teamNumber =
    params.number && typeof params.number === 'string' ? parseInt(params.number, 10) : null;
  const t = useTranslations('pages.team');

  const { data: team, error } = useSWR<TeamSummary | null>(`/portal/teams/${teamNumber}/summary`, {
    suspense: true,
    fallbackData: null
  });

  if (!team) {
    if (error) {
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
                href="/teams"
                variant="outlined"
                startIcon={<LocationIcon />}
              >
                {t('not-found.back-to-teams')}
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          <TeamProvider value={team}>
            <TeamContents />

            <Box sx={{ flex: 1 }}>
              <TeamHeader />
              <TeamResults />
            </Box>
          </TeamProvider>
        </Box>
      </Container>
    </Box>
  );
}
