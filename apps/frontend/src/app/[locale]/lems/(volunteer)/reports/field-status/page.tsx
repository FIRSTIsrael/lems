'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Container, Stack, Alert, CircularProgress, Grid } from '@mui/material';
import { useFieldStatus } from './hooks';
import {
  MatchCountdown,
  ActiveMatchPanel,
  NextMatchPanel,
  QueueOverview,
  UpcomingMatches,
  FieldHealthMetrics,
  JudgingIntegration
} from './components';

/**
 * Field Status Report Page
 * Comprehensive real-time view of field operations
 */
export default function FieldStatusPage() {
  const searchParams = useSearchParams();
  const divisionId = searchParams.get('divisionId') || '';

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
