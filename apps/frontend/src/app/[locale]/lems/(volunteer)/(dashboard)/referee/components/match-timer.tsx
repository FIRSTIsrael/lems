'use client';

import { Box, Paper, Typography, LinearProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useReferee } from './referee-context';

export const RefereeMatchTimer = () => {
  const t = useTranslations('pages.referee');
  const router = useRouter();
  const currentTime = useTime({ interval: 1000 });
  const { activeMatch, matchLength } = useReferee();

  const elapsedSeconds = useMemo(() => {
    if (!activeMatch?.startTime) return 0;
    const startTime = new Date(activeMatch.startTime).getTime();
    return Math.floor((currentTime.valueOf() - startTime) / 1000);
  }, [activeMatch, currentTime]);

  const timeRemaining = Math.max(0, matchLength - elapsedSeconds);
  const progress = (elapsedSeconds / matchLength) * 100;

  const targetDate = useMemo(() => {
    return new Date(currentTime.valueOf() + timeRemaining * 1000);
  }, [timeRemaining, currentTime]);

  return (
    <Paper
      elevation={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        p: 4,
        borderRadius: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, opacity: 0.9, fontWeight: 500 }}>
        {t('match-running')}
      </Typography>

      <Box sx={{ my: 3 }}>
        <Countdown targetDate={targetDate} variant="h2" />
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(255,255,255,0.2)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#fff'
          }
        }}
      />

      <Typography variant="caption" sx={{ mt: 2, display: 'block', opacity: 0.8 }}>
        {t('match-slug')}: {activeMatch?.slug}
      </Typography>
    </Paper>
  );
};
