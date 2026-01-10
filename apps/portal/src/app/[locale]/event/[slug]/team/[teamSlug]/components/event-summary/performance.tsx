'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Grid, Stack } from '@mui/material';
import { TrendingUp as ScoreIcon, SmartToy as RobotIcon } from '@mui/icons-material';

interface PerformanceMetricsProps {
  highestScore: number | null;
  robotGameRank: number | null;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  highestScore,
  robotGameRank
}) => {
  const t = useTranslations('pages.team-in-event');

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
          {highestScore ?? '-'}
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
          {robotGameRank ?? '-'}
        </Typography>
      </Grid>
    </>
  );
};
