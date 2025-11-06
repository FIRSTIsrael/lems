'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { AwardsSection } from './awards-section';
import { PerformanceMetrics } from './performance';
import { MatchResults } from './match-results';

export const EventSummary: React.FC = () => {
  const t = useTranslations('pages.team-in-event');

  return (
    <Paper
      sx={{
        p: 3,
        mb: { xs: 3, lg: 0 },
        flexGrow: { xs: 0, lg: 1 },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" fontWeight="700" mb={1}>
          {t('performance.event-summary')}
        </Typography>
        <Grid container spacing={2}>
          <AwardsSection />
          <PerformanceMetrics />
        </Grid>
      </Box>

      <MatchResults />
    </Paper>
  );
};
