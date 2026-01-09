'use client';

import { Box, Container, Stack, Alert, CircularProgress, Grid } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { useFieldStatus } from './hooks';
import { MatchCountdown } from './components/match-countdown';
import { ActiveMatchPanel } from './components/active-match-panel';
import { NextMatchPanel } from './components/next-match-panel';
import { QueueOverview } from './components/queue-overview';
import { UpcomingMatches } from './components/upcoming-matches';
import { FieldHealthMetrics } from './components/field-health-metrics';
import { JudgingIntegration } from './components/judging-integration';

/**
 * Field Status Report Page
 * Comprehensive real-time view of field operations
 */
export default function FieldStatusPage() {
  const { currentDivision } = useEvent();
  const divisionId = currentDivision.id;

  const {
    division,
    activeMatch,
    loadedMatch,
    queuedMatches,
    upcomingMatches,
    activeSessions,
    matches,
    loading,
    error
  } = useFieldStatus({ divisionId });

  if (loading && !division) {
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

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">שגיאה בטעינת נתונים: {error.message}</Alert>
        </Box>
      </Container>
    );
  }

  if (!division) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="warning">לא נמצאה בית ספר</Alert>
        </Box>
      </Container>
    );
  }

  // Calculate tables ready for countdown
  const tablesReady = loadedMatch?.participants.filter((p: any) => p.ready).length || 0;
  const totalTables = loadedMatch?.participants.filter((p: any) => p.team).length || 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Countdown Timer */}
        <MatchCountdown
          scheduledTime={loadedMatch?.scheduledTime}
          tablesReady={tablesReady}
          totalTables={totalTables}
        />

        {/* Active and Next Match - Side by Side on Desktop */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ActiveMatchPanel match={activeMatch} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <NextMatchPanel match={loadedMatch} activeSessions={activeSessions} />
          </Grid>
        </Grid>

        {/* Queue Overview */}
        <QueueOverview matches={queuedMatches} />

        {/* Two-Column Layout for Metrics and Integration */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <FieldHealthMetrics matches={matches} />
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <JudgingIntegration activeSessions={activeSessions} queuedMatches={queuedMatches} />
          </Grid>
        </Grid>

        {/* Upcoming Matches */}
        <UpcomingMatches matches={upcomingMatches} />
      </Stack>
    </Container>
  );
}
