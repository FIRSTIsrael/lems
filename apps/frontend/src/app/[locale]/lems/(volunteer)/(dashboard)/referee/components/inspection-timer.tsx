'use client';

import { Paper, Typography, Stack } from '@mui/material';
import { Timer } from '@mui/icons-material';
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
      elevation={4}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'fixed',
        bottom: 32,
        right: 32,
        minWidth: 200,
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        backgroundColor: 'background.paper',
        borderRadius: 2
      }}
    >
      <Stack spacing={1} alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Timer sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            {t('inspection-timer')}
          </Typography>
        </Stack>
        <Countdown
          targetDate={targetDate}
          expiredText="00:00"
          variant="h3"
          sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
        />
      </Stack>
    </Paper>
  );
}
