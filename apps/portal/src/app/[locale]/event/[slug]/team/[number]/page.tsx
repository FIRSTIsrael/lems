'use client';

import { Box, Container, Grid } from '@mui/material';
import { Suspense } from 'react';
import { TeamInfoHeader } from './components/team-info-header';
import { EventSummary } from './components/event-summary/event-summary';
import { TeamSchedule } from './components/team-schedule';
import { TeamAtEventProvider } from './components/team-at-event-context';
import { LoadingSkeleton } from './components/loading-skeleton';

export default function TeamAtEventPage() {
  return (
    <TeamAtEventProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Grid container spacing={3} sx={{ alignItems: { lg: 'stretch' } }}>
            <Grid
              size={{ xs: 12, lg: 8 }}
              sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0, lg: 3 } }}
            >
              <TeamInfoHeader />
              <Suspense fallback={<LoadingSkeleton />}>
                <EventSummary />
              </Suspense>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Suspense fallback={<LoadingSkeleton />}>
                <TeamSchedule />
              </Suspense>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </TeamAtEventProvider>
  );
}
