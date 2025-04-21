import { useState, useEffect } from 'react';
import { Button, Paper, Stack, Typography, LinearProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import { Countdown } from './countdown';

const JUDGING_FLOW = [
  { name: 'זמן התכוננות', duration: 120 }, // 2 minutes
  { name: 'הצגת פרויקט', duration: 300 }, // 5 minutes
  { name: 'שאלות פרויקט', duration: 300 }, // 5 minutes
  { name: 'הצגת רובוט', duration: 300 }, // 5 minutes
  { name: 'שאלות רובוט', duration: 300 }, // 5 minutes
  { name: 'שיתוף מסכם', duration: 360 } // 6 minutes
];

const TOTAL_SESSION_LENGTH = JUDGING_FLOW.reduce((sum, phase) => sum + phase.duration, 0);

export const JudgingTimer = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => setCurrentTime(dayjs()), 100);
      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const handleStart = () => {
    setStartTime(currentTime.toDate());
    setIsRunning(true);
  };

  const handleReset = () => {
    setStartTime(null);
    setIsRunning(false);
  };

  const getProgressValue = () => {
    if (!startTime || !isRunning) return 0;
    const sessionEnd = dayjs(startTime).add(TOTAL_SESSION_LENGTH, 'seconds');
    const progress = 100 - sessionEnd.diff(currentTime) / (TOTAL_SESSION_LENGTH * 10);
    return Math.min(100, Math.max(0, progress));
  };

  const getProgressColor = () => {
    if (!startTime || !isRunning) return 'primary';
    const timeLeft = dayjs(startTime)
      .add(TOTAL_SESSION_LENGTH, 'seconds')
      .diff(currentTime, 'seconds');
    if (timeLeft <= 0) return 'error';
    if (timeLeft <= 60) return 'warning';
    return 'success';
  };

  const getCurrentPhase = () => {
    if (!startTime || !isRunning) return -1;
    const elapsed = currentTime.diff(startTime, 'seconds');
    let accumulatedTime = 0;

    for (let i = 0; i < JUDGING_FLOW.length; i++) {
      accumulatedTime += JUDGING_FLOW[i].duration;
      if (elapsed < accumulatedTime) return i;
    }

    return JUDGING_FLOW.length - 1;
  };

  const getPhaseTimeRemaining = (phaseIndex: number) => {
    if (!startTime || !isRunning || phaseIndex < 0) return null;

    const elapsed = currentTime.diff(startTime, 'seconds');
    let accumulatedTime = 0;

    // Sum up all previous phases
    for (let i = 0; i < phaseIndex; i++) {
      accumulatedTime += JUDGING_FLOW[i].duration;
    }

    // If we haven't reached this phase yet
    if (elapsed < accumulatedTime) return JUDGING_FLOW[phaseIndex].duration;

    // If we're in this phase
    if (elapsed < accumulatedTime + JUDGING_FLOW[phaseIndex].duration) {
      return Math.max(0, accumulatedTime + JUDGING_FLOW[phaseIndex].duration - elapsed);
    }

    // If we're past this phase
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
      {isRunning && (
        <Paper
          sx={{
            p: 2,
            width: 250,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {JUDGING_FLOW.map((phase, index) => {
            const timeRemaining = getPhaseTimeRemaining(index);
            const minutes = Math.floor((timeRemaining || 0) / 60);
            const seconds = (timeRemaining || 0) % 60;

            return (
              <Box
                key={phase.name}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: index === getCurrentPhase() ? 'primary.main' : 'grey.100',
                  color: index === getCurrentPhase() ? 'primary.contrastText' : 'text.primary',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="body2">{phase.name}</Typography>
                {timeRemaining !== null && (
                  <Typography
                    variant="body2"
                    fontFamily="Roboto Mono"
                    sx={{ opacity: index === getCurrentPhase() ? 1 : 0.5 }}
                  >
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Paper>
      )}

      <Paper sx={{ py: 4, px: 2, textAlign: 'center', flexGrow: 1 }}>
        <Stack spacing={2}>
          {isRunning && (
            <>
              <Countdown
                targetDate={dayjs(startTime).add(TOTAL_SESSION_LENGTH, 'seconds').toDate()}
                allowNegativeValues={true}
                variant="h1"
                fontFamily="Roboto Mono"
                sx={{
                  fontSize: {
                    xs: '15vw',
                    sm: '12vw',
                    md: '10vw',
                    lg: '8vw'
                  },
                  fontWeight: 700
                }}
                dir="ltr"
              />
              <LinearProgress
                color={getProgressColor()}
                variant="determinate"
                value={getProgressValue()}
                sx={{
                  height: 16,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  mt: -2
                }}
              />
            </>
          )}
          <Button
            variant="contained"
            color={isRunning ? 'error' : 'primary'}
            size="large"
            onClick={isRunning ? handleReset : handleStart}
            sx={{ mt: isRunning ? 2 : 0 }}
          >
            {isRunning ? 'איפוס טיימר' : 'התחל שיפוט'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
