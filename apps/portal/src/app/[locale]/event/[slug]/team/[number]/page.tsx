'use client';

import React from 'react';
import { Box, Container, Grid } from '@mui/material';
import { TeamInfoHeader } from './components/team-info-header';
import { EventSummary } from './components/event-summary/event-summary';
import { TeamSchedule } from './components/team-schedule';
import { TeamAtEventDataProvider } from './components/team-at-event-data-context';

export default function TeamAtEventPage() {
  return (
    <TeamAtEventDataProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
        <Container maxWidth="xl" sx={{ py: 2 }}>
          <Grid container spacing={3} sx={{ alignItems: { lg: 'stretch' } }}>
            <Grid
              size={{ xs: 12, lg: 8 }}
              sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 0, lg: 3 } }}
            >
              <TeamInfoHeader />
              <EventSummary />
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex', flexDirection: 'column' }}>
              <TeamSchedule />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </TeamAtEventDataProvider>
  );
}
