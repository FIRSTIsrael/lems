'use client';

import { useMemo } from 'react';
import { Box, Container, Stack, CircularProgress, Grid } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_FIELD_STATUS_DATA,
  parseFieldStatusData,
  createMatchLoadedSubscription,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createMatchAbortedSubscription,
  createParticipantStatusUpdatedSubscription,
  createMatchStageAdvancedSubscription
} from './graphql';
import { MatchCountdown } from './components/match-countdown';
import { ActiveMatchPanel } from './components/active-match-panel';
import { NextMatchPanel } from './components/next-match-panel';
import { UpcomingMatches } from './components/upcoming-matches';
import { FieldStatusProvider, useFieldStatusData } from './components/field-status-context';

function FieldStatusContent() {
  const { activeMatch, loadedMatch, upcomingMatches, matchLength } = useFieldStatusData();

  const tablesReady = loadedMatch?.participants.filter(p => p.ready && p.team).length || 0;
  const totalTables = loadedMatch?.participants.filter(p => p.team).length || 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <MatchCountdown
          scheduledTime={loadedMatch?.scheduledTime}
          tablesReady={tablesReady}
          totalTables={totalTables}
          matchLength={matchLength}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ActiveMatchPanel match={activeMatch} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <NextMatchPanel match={loadedMatch} />
          </Grid>
        </Grid>

        <UpcomingMatches matches={upcomingMatches} loadedMatchId={loadedMatch?.id} />
      </Stack>
    </Container>
  );
}

export default function FieldStatusPage() {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createParticipantStatusUpdatedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_FIELD_STATUS_DATA,
    {
      divisionId: currentDivision.id
    },
    parseFieldStatusData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load field status data');
  }

  if (loading || !data) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <FieldStatusProvider data={data}>
      <FieldStatusContent />
    </FieldStatusProvider>
  );
}
