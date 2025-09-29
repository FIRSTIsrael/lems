'use client';

import { useTranslations } from 'next-intl';
import { Stack, Button } from '@mui/material';
import { PlayArrow, Stop, Pause } from '@mui/icons-material';

interface JudgingTimerControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onStop: () => void;
}

export const JudgingTimerControls: React.FC<JudgingTimerControlsProps> = ({
  isPaused,
  onPause,
  onStop
}) => {
  const t = useTranslations('pages.tools.judging-timer');

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
      <Button
        variant="contained"
        color={isPaused ? 'primary' : 'warning'}
        startIcon={isPaused ? <PlayArrow /> : <Pause />}
        onClick={onPause}
        sx={{ width: 120 }}
      >
        {isPaused ? t('resume') : t('pause')}
      </Button>
      <Button
        variant="contained"
        color="error"
        startIcon={<Stop />}
        onClick={onStop}
        sx={{ width: 120 }}
      >
        {t('stop')}
      </Button>
    </Stack>
  );
};

