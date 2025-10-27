'use client';

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Box, Container, Typography, Paper, Button, Grid } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { DirectionalIcon } from '@lems/localization';
import { TeamInEventData } from '@lems/types/api/portal';
import { TeamInfoHeader } from './components/team-info-header';
import { EventSummary } from './components/event-summary';
import { TeamSchedule } from './components/team-schedule';

export default function TeamInEventPage() {
  const params = useParams();
  const eventSlug = params.slug as string;
  const teamNumber =
    params.number && typeof params.number === 'string' ? parseInt(params.number, 10) : null;

  const t = useTranslations('pages.team-in-event');

  const { data: teamData, error } = useSWR<TeamInEventData | null>(
    `/portal/events/${eventSlug}/teams/${teamNumber}`,
    { suspense: true, fallbackData: null }
  );


  if (error || !teamData) {
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

  const { team, eventName, divisionName, awards, matches, judgingSessions, scoreboard } = teamData;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Grid container spacing={3} sx={{ alignItems: { lg: 'stretch' } }}>
          <Grid
            size={{ xs: 12, lg: 8 }}
            sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0, lg: 3 } }}
          >
            <TeamInfoHeader
              team={team}
              eventName={eventName}
              eventSlug={eventSlug}
              divisionName={divisionName}
            />
            <EventSummary teamAwards={awards} teamScoreboard={scoreboard} />
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
            <TeamSchedule
              teamMatches={matches}
              teamJudging={judgingSessions}
              teamNumber={team.number}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
