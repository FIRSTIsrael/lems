'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { TeamRobotPerformance } from '@lems/types/api/portal';
import { useRealtimeData } from '../../../../../../hooks/use-realtime-data';
import { useTeamAtEvent } from '../team-at-event-context';
import { AwardsSection } from './awards-section';
import { PerformanceMetrics } from './performance';
import { MatchResults } from './match-results';

export const EventSummary: React.FC = () => {
  const t = useTranslations('pages.team-in-event');

  const { event, team } = useTeamAtEvent();

  const { data: robotPerformance } = useRealtimeData<TeamRobotPerformance>(
    `/portal/events/${event.slug}/teams/${team.slug}/robot-performance`,
    { suspense: true }
  );

  if (!robotPerformance) {
    return null; // Should be handled by suspense
  }

  const { scores, highestScore, robotGameRank } = robotPerformance;

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
      <Box>
        <Typography variant="h6" fontWeight="700" mb={1}>
          {t('performance.event-summary')}
        </Typography>
        <Grid container spacing={2}>
          <AwardsSection />
          <PerformanceMetrics highestScore={highestScore} robotGameRank={robotGameRank} />
        </Grid>
      </Box>

      {scores.length > 0 && <MatchResults scores={scores} />}
    </Paper>
  );
};
