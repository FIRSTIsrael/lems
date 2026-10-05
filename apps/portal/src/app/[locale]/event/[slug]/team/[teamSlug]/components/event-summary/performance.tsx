'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Grid, Stack } from '@mui/material';
import { TrendingUp as ScoreIcon, SmartToy as RobotIcon } from '@mui/icons-material';
import { formatHeadlineScore, RankingStrategy } from '@lems/shared/utils';

interface PerformanceMetricsProps {
  highestScore: number | null;
  robotGameRank: number | null;
  rankingStrategy: RankingStrategy;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  highestScore,
  robotGameRank,
  rankingStrategy
}) => {
  const t = useTranslations('pages.team-in-event');
  const headlineScoreT = useTranslations('robot-game.headline-score');

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
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center'
          }}
        >
          <ScoreIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Typography
            variant="body1"
            sx={{
              fontWeight: '600'
            }}
          >
            {headlineScoreT(rankingStrategy)}
          </Typography>
        </Stack>
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: '600'
          }}
        >
          {highestScore !== null ? formatHeadlineScore(highestScore) : '-'}
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
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: 'center'
          }}
        >
          <RobotIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Typography
            variant="body1"
            sx={{
              fontWeight: '600'
            }}
          >
            {t('performance.robot-game-rank')}
          </Typography>
        </Stack>
        <Typography
          variant="h6"
          color="primary"
          sx={{
            fontWeight: '600'
          }}
        >
          {robotGameRank ?? '-'}
        </Typography>
      </Grid>
    </>
  );
};
