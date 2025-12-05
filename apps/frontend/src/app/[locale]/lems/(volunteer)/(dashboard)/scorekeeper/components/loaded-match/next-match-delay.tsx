'use client';

import dayjs from 'dayjs';
import { Stack, Chip } from '@mui/material';
import { Countdown } from '../../../../../../../../lib/time/countdown';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { useScorekeeperData } from '../scorekeeper-context';

export const NextMatchDelay: React.FC = () => {
  const { loadedMatch: match } = useScorekeeperData();
  const currentTime = useTime({ interval: 1000 });

  if (!match?.scheduledTime) return null;

  const { scheduledTime } = match;
  const isClose = dayjs(scheduledTime).diff(currentTime, 'minute') <= 2;

  return (
    <Stack direction="row" gap={0.75} alignItems="center">
      <Chip
        label={dayjs(scheduledTime).format('HH:mm')}
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
        label={
          <Countdown
            targetDate={new Date(scheduledTime)}
            allowNegativeValues={true}
            fontSize="0.75rem"
            fontFamily="monospace"
            fontWeight={500}
            dir="ltr"
          />
        }
        variant="filled"
        size="small"
        color={isClose ? 'warning' : 'success'}
        sx={{ height: 24 }}
      />
    </Stack>
  );
};
