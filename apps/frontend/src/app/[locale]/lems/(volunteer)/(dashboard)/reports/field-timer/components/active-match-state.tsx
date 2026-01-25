'use client';

import { Box, Stack } from '@mui/material';
import { TimerDisplay } from './timer-display';
import { MatchInfo } from './match-info';
import { ProgressBar } from './progress-bar';
import { useFieldTimer } from './field-timer-context';

interface ActiveMatchStateProps {
  isDesktop: boolean;
}

export function ActiveMatchState({ isDesktop }: ActiveMatchStateProps) {
  const { activeMatch, matchEndTime, percentRemaining } = useFieldTimer();

  if (!activeMatch) {
    return null;
  }

  return (
    <Stack
      spacing={isDesktop ? 4 : 2}
      sx={{ width: '100%', maxWidth: '800px', alignItems: 'center' }}
    >
      <MatchInfo match={activeMatch} isDesktop={isDesktop} />
      <Box sx={{ width: '100%' }}>
        <TimerDisplay targetDate={matchEndTime} isDesktop={isDesktop} />
        <ProgressBar percentRemaining={percentRemaining} />
      </Box>
    </Stack>
  );
}
