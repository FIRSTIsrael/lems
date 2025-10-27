'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { TeamInEventData } from '@lems/types/api/portal';
import { AwardsSection } from './event-summaary/awards-section';
import { PerformanceMetrics } from './event-summaary/performance';
import { MatchResults } from './event-summaary/match-results';

interface EventSummaryProps {
  teamAwards: TeamInEventData['awards'];
  teamScoreboard: TeamInEventData['scoreboard'];
}

export const EventSummary: React.FC<EventSummaryProps> = ({ teamAwards, teamScoreboard }) => {
  const t = useTranslations('pages.team-in-event');

  return (
    <Paper sx={{ 
      p: 3, 
      mb: { xs: 3, lg: 0 },
      flexGrow: { xs: 0, lg: 1 },
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box mb={2}>
        <Typography variant="h6" fontWeight="700" mb={1}>
          {t('performance.event-summary')}
        </Typography>
        <Grid container spacing={2}>
          <AwardsSection awards={teamAwards} />
          <PerformanceMetrics scoreboard={teamScoreboard} />
        </Grid>
      </Box>

      <MatchResults scores={teamScoreboard?.scores || []} />
    </Paper>
  );
};
