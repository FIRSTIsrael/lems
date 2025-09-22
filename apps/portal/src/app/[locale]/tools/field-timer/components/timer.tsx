'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, LinearProgress, Card, CardContent, Stack, Button } from '@mui/material';
import dayjs from 'dayjs';
import { useTime, Countdown } from '@lems/shared';

const MATCH_LENGTH = 2.5 * 60; // 2.5 minutes in seconds
const ENDGAME_PERCENT = 20;

export const Timer = () => {
  const router = useRouter();
  const currentTime = useTime({ interval: 100 });
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [audio, setAudio] = useState<Record<string, HTMLAudioElement> | null>(null);

  useEffect(() => {
    setAudio({
      start: new Audio('/assets/sounds/field/field-start.wav'),
      endgame: new Audio('/assets/sounds/field/field-endgame.wav'),
      end: new Audio('/assets/sounds/field/field-end.wav')
    });
  }, []);

  const getCountdownTarget = (startTime: Date) =>
    dayjs(startTime).add(MATCH_LENGTH, 'seconds').toDate();

  const endTime = useMemo(() => dayjs(startTime).add(MATCH_LENGTH, 'seconds'), [startTime]);

  const percentLeft = useMemo(
    () => (isRunning ? endTime.diff(currentTime) / (10 * MATCH_LENGTH) : 100),
    [currentTime, endTime, isRunning]
  );

  const isEndgame = percentLeft <= ENDGAME_PERCENT;

  const handleStartStop = () => {
    if (isRunning) {
      // Stop and reset
      setIsRunning(false);
      setStartTime(null);
    } else {
      // Start timer
      setIsRunning(true);
      setStartTime(new Date());
      audio?.start.play();
    }
  };

  return (
    <Card sx={{ maxWidth: 900, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Box textAlign="center">
            <Countdown
              targetDate={startTime ? getCountdownTarget(startTime) : new Date(0)}
              expiredText="00:00"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: { xs: '4rem', sm: '5rem', md: '6rem' },
                lineHeight: 1,
                mt: 1
              }}
            />
          </Box>

          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={percentLeft}
              sx={{
                height: 16,
                borderRadius: 2,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: isEndgame ? 'error.main' : 'primary.main'
                }
              }}
            />
            <Box display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {Math.floor(MATCH_LENGTH / 60)}:{MATCH_LENGTH % 60}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartStop}
              sx={{ minWidth: 120 }}
            >
              {isRunning ? 'Stop & Reset' : 'Start Timer'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push('/tools/scorer')}
              sx={{ minWidth: 120 }}
            >
              Go to Scorer
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};
