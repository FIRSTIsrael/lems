'use client';

import { useMemo } from 'react';
import { Box, Paper, Stack, LinearProgress } from '@mui/material';
import { Dayjs } from 'dayjs';
import { Countdown } from '../../../../../../../../lib/time/countdown';
import { JudgingSession } from '../graphql';

interface CountdownHeaderProps {
  currentSessions: JudgingSession[];
  sessionLength: number;
  currentTime: Dayjs;
}

export const CountdownHeader: React.FC<CountdownHeaderProps> = ({
  currentSessions,
  sessionLength,
  currentTime
}) => {
  const scheduledTime = useMemo(() => {
    if (currentSessions.length === 0) return null;
    const sessionDate = new Date(currentSessions[0].scheduledTime);
    return currentTime
      .hour(sessionDate.getHours())
      .minute(sessionDate.getMinutes())
      .second(sessionDate.getSeconds());
  }, [currentSessions, currentTime]);

  return (
    <Paper
      sx={{
        my: 3,
        p: { xs: 3, sm: 4, md: 5 },
        borderRadius: 2
      }}
    >
      <Stack spacing={2} alignItems="center" justifyContent="center">
        <Box
          sx={{
            textAlign: 'center',
            '& .MuiTypography-root': {
              fontFamily: 'monospace !important',
              fontWeight: '900 !important',
              color: 'text.primary',
              fontSize: { xs: '6rem', sm: '8rem', md: '10rem', lg: '12rem' },
              lineHeight: 0.8,
              letterSpacing: '0.05em'
            }
          }}
        >
          <Countdown
            targetDate={new Date(currentSessions[0].scheduledTime)}
            allowNegativeValues={true}
            fontFamily="monospace"
            fontWeight={900}
            dir="ltr"
          />
        </Box>

        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(() => {
              const minutesDiff = scheduledTime.diff(currentTime, 'minute');
              if (minutesDiff < 0) {
                const elapsedMinutes = Math.abs(minutesDiff);
                const sessionDurationMinutes = sessionLength / 60;
                const progress = (elapsedMinutes / sessionDurationMinutes) * 100;
                return Math.min(100, progress);
              }

              if (minutesDiff > 0) {
                const maxWaitMinutes = 30;
                if (minutesDiff > maxWaitMinutes) return 0;
                return ((maxWaitMinutes - minutesDiff) / maxWaitMinutes) * 100;
              }

              return 50;
            })()}
            sx={{
              height: 12,
              borderRadius: 6,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                bgcolor: (() => {
                  const minutesDiff = scheduledTime.diff(currentTime, 'minute');

                  if (minutesDiff > 2) return 'success.main';
                  if (minutesDiff > 0) return 'warning.main';
                  return 'error.main';
                })(),
                borderRadius: 6
              }
            }}
          />
        </Box>
      </Stack>
    </Paper>
  );
};
