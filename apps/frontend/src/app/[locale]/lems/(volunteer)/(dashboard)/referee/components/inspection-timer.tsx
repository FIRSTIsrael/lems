'use client';

import { Paper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../lib/time/hooks';

interface InspectionTimerProps {
  timeRemaining: number | undefined;
}

export function InspectionTimer({ timeRemaining }: InspectionTimerProps) {
  const t = useTranslations('pages.referee');
  const currentTime = useTime({ interval: 1000 });

  const targetDate = useMemo(() => {
    if (!timeRemaining) return new Date();
    return new Date(currentTime.valueOf() + timeRemaining * 1000);
  }, [timeRemaining, currentTime]);

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        bottom: 20,
        right: 20,
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447'
      }}
    >
      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
        {t('inspection-timer')}
      </Typography>
      <Countdown targetDate={targetDate} expiredText="00:00" variant="h6" />
    </Paper>
  );
}
