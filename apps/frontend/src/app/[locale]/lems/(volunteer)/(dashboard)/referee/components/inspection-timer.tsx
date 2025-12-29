'use client';

import { Paper, Typography, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { Countdown } from '../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../lib/time/hooks';
import { useReferee } from './referee-context';

export function InspectionTimer() {
  const t = useTranslations('pages.referee');
  const { inspectionStartTime, setInspectionStartTime, inspectionTimeRemaining } = useReferee();
  const currentTime = useTime({ interval: 1000 });

  const targetDate = useMemo(() => {
    if (!inspectionTimeRemaining) return new Date();
    return new Date(currentTime.valueOf() + inspectionTimeRemaining * 1000);
  }, [inspectionTimeRemaining, currentTime]);

  if (!inspectionStartTime) {
    return null;
  }

  return (
    <Paper
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: '#f5f5f5',
        borderRadius: 1,
        textAlign: 'center'
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 2 }}>
        {t('inspection-timer')}
      </Typography>
      <Countdown targetDate={targetDate} variant="h4" />
      <Button size="small" sx={{ mt: 2 }} onClick={() => setInspectionStartTime(null)}>
        {t('stop-inspection')}
      </Button>
    </Paper>
  );
}
