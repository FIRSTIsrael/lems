'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Typography, LinearProgress, Stack, useTheme } from '@mui/material';
import { useScorekeeperData } from '../scorekeeper-context';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { Countdown } from '../../../../../../../../lib/time/countdown';

const getProgressColor = (progressPercent: number) => {
  if (progressPercent >= 20) return 'success';
  return 'warning';
};

export const ActiveMatchTime = () => {
  const t = useTranslations('pages.scorekeeper.current-match');
  const theme = useTheme();

  const { activeMatch: match, matchLength } = useScorekeeperData();
  const currentTime = useTime({ interval: 1000 });

  if (!match || !match.startTime) return null;

  const startTime = dayjs(match.startTime);
  const endTime = dayjs(match.startTime).add(matchLength, 'second');

  const elapsedTime = currentTime.diff(startTime, 'second');
  const timeRemaining = Math.max(0, matchLength - elapsedTime);
  const progressPercent = (timeRemaining / matchLength) * 100;
  const isEndgame = progressPercent <= 20;

  return (
    <Stack spacing={0.75} sx={{ mb: 1.5, flex: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: 0.5
          }}
        >
          {t('time-remaining')}
        </Typography>
        <Countdown
          variant="subtitle2"
          targetDate={endTime.toDate()}
          fontFamily="monospace"
          fontWeight={700}
          fontSize="1.1rem"
          sx={{
            color: isEndgame ? theme.palette.warning.main : theme.palette.success.main
          }}
        />
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progressPercent}
        color={getProgressColor(progressPercent)}
        sx={{
          height: 6,
          borderRadius: 1,
          backgroundColor: theme.palette.action.hover,
          '& .MuiLinearProgress-bar': {
            borderRadius: 1
          }
        }}
      />
    </Stack>
  );
};
