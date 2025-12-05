'use client';

import { useMemo } from 'react';
import { Stack, Chip } from '@mui/material';
import { Match } from '../../scorekeeper.graphql';

interface NextMatchDelayProps {
  match: Match;
}

const calculateDelay = (scheduledTime: string): string => {
  const scheduled = new Date(scheduledTime).getTime();
  const now = Date.now();
  const delayMs = now - scheduled;
  const delaySecs = Math.round(delayMs / 1000);

  const sign = delaySecs < 0 ? '-' : '+';
  const absSecs = Math.abs(delaySecs);
  const mins = Math.floor(absSecs / 60);
  const secs = absSecs % 60;

  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
};

export const NextMatchDelay: React.FC<NextMatchDelayProps> = ({ match }) => {
  const { scheduledTime } = match;

  const displayTime = useMemo(() => {
    if (!scheduledTime) return '—';
    return new Date(scheduledTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [scheduledTime]);

  const displayDelay = useMemo(() => {
    return currentDelay || (scheduledTime ? calculateDelay(scheduledTime) : '—');
  }, [scheduledTime, currentDelay]);

  const isOnTime = displayDelay.startsWith('-') || displayDelay.startsWith('+0:');

  return (
    <Stack direction="row" gap={0.75} alignItems="center">
      <Chip
        label={displayTime}
        variant="outlined"
        size="small"
        sx={{
          height: 24,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          fontWeight: 500
        }}
      />
      <Chip
        label={displayDelay}
        variant="filled"
        size="small"
        color={isOnTime ? 'success' : 'warning'}
        sx={{
          height: 24,
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          fontWeight: 500
        }}
      />
    </Stack>
  );
};
