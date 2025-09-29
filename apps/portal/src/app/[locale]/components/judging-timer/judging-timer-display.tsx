'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Typography, Paper, LinearProgress, Stack } from '@mui/material';
import Countdown from './countdown';
import { JudgingTimerControls } from './judging-timer-controls';

interface JudgingTimerDisplayProps {
  sessionEnd: Date | null;
  secondsJudging: number;
  isPaused: boolean;
  onPause: () => void;
  onStop: () => void;
}

const JUDGING_SESSION_LENGTH = 28 * 60;

export const JudgingTimerDisplay: React.FC<JudgingTimerDisplayProps> = ({
  sessionEnd,
  secondsJudging,
  isPaused,
  onPause,
  onStop
}) => {
  const t = useTranslations('pages.tools.judging-timer');

  const barProgress = useMemo(() => {
    return 100 - (secondsJudging / JUDGING_SESSION_LENGTH) * 100;
  }, [secondsJudging]);

  return (
    <Stack
      component={Paper}
      spacing={2}
      sx={{
        py: 4,
        px: 2,
        textAlign: 'center'
      }}
      alignItems="center"
    >
      <Countdown
        targetDate={sessionEnd || new Date()}
        expiredText="00:00"
        variant="h1"
        fontFamily="Roboto Mono"
        fontSize="10rem"
        fontWeight={700}
        dir="ltr"
      />
      <Typography
        variant="body1"
        fontSize="1.5rem"
        fontWeight={600}
        sx={{ color: '#666' }}
        gutterBottom
      >
        {t('session-ends-at')} {sessionEnd ? new Date(sessionEnd).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={barProgress}
        color={barProgress !== 0 ? 'primary' : 'error'}
        sx={{ width: '80%', borderRadius: 32, height: 16 }}
      />

      <JudgingTimerControls
        isPaused={isPaused}
        onPause={onPause}
        onStop={onStop}
      />
    </Stack>
  );
};

