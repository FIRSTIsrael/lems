'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { AwardsSection } from './event-summaary/awards-section';
import { PerformanceMetrics } from './event-summaary/performance';
import { MatchResults } from './event-summaary/match-results';

interface Award {
  id: string;
  name: string;
  place: number;
}

interface TeamScoreboard {
  robotGameRank: number | null;
  maxScore: number | null;
  scores: number[] | null;
}

interface EventSummaryProps {
  teamAwards: Award[];
  teamScoreboard?: TeamScoreboard;
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

      {teamScoreboard?.scores && teamScoreboard.scores.length > 0 && (
        <MatchResults scores={teamScoreboard.scores} />
      )}
    </Paper>
  );
};
