'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Grid, Stack } from '@mui/material';
import { TrendingUp as ScoreIcon, SmartToy as RobotIcon } from '@mui/icons-material';
import { TeamAtEventData } from '@lems/types/api/portal';

interface PerformanceMetricsProps {
  scoreboard: TeamAtEventData['scoreboard'];
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ scoreboard }) => {
  const t = useTranslations('pages.team-in-event');
  // Hide cards for unpublished events from team page, show a link to the team at event page instead - not done

  // if (!scoreboard) {
  //   return (
  //     <Grid size={{ xs: 12 }}>
  //       <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
  //         {t('performance.no-data')}
  //       </Typography>
  //     </Grid>
  //   );
  // }

  const hasScores = scoreboard?.scores && scoreboard.scores.length > 0;
  const highestScore = hasScores ? Math.max(...scoreboard.scores!) : null;

  return (
    <>
      <Grid
        size={{ xs: 12, sm: 6, lg: 3 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ScoreIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Typography variant="body1" fontWeight="600">
            {t('performance.highest-score')}
          </Typography>
        </Stack>
        <Typography variant="h6" fontWeight="600" color="primary">
          {highestScore || 0}
        </Typography>
      </Grid>

      <Grid
        size={{ xs: 12, sm: 6, lg: 3 }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'grey.200'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <RobotIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Typography variant="body1" fontWeight="600">
            {t('performance.robot-game-rank')}
          </Typography>
        </Stack>
        <Typography variant="h6" fontWeight="600" color="primary">
          {scoreboard?.robotGameRank || 0}
        </Typography>
      </Grid>
    </>
  );
};
