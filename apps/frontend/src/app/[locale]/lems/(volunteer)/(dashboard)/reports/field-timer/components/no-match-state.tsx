'use client';

import { Box, Stack } from '@mui/material';
import { TimerDisplay } from './timer-display';
import { ProgressBar } from './progress-bar';
import { NextMatchInfo } from './next-match-info';
import { useFieldTimer } from './field-timer-context';

interface NoMatchStateProps {
  isDesktop: boolean;
}

export function NoMatchState({ isDesktop }: NoMatchStateProps) {
  const { nextMatch } = useFieldTimer();

  return (
    <Stack
      spacing={isDesktop ? 4 : 3}
      sx={{ width: '100%', maxWidth: '800px', alignItems: 'center' }}
    >
      <Box sx={{ width: '100%' }}>
        <TimerDisplay targetDate={new Date(0)} isDesktop={isDesktop} />
        <ProgressBar percentRemaining={0} />
      </Box>
      {nextMatch && <NextMatchInfo />}
    </Stack>
  );
}
