import { useState, useEffect, useRef } from 'react';
import { Button, Paper, Stack, LinearProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import { Countdown } from '../judging/countdown';
import Link from 'next/link';

const MATCH_DURATION = 150; // 2.5 minutes in seconds

export const FieldTimer = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [lastTimeWarning, setLastTimeWarning] = useState(false);

  const sounds = useRef<{
    start: HTMLAudioElement | null;
    abort: HTMLAudioElement | null;
    endgame: HTMLAudioElement | null;
    end: HTMLAudioElement | null;
  }>({
    start: null,
    abort: null,
    endgame: null,
    end: null
  });

  useEffect(() => {
    // Initialize audio elements
    sounds.current = {
      start: new Audio('/sounds/field/field-start.wav'),
      abort: new Audio('/sounds/field/field-abort.wav'),
      endgame: new Audio('/sounds/field/field-endgame.wav'),
      end: new Audio('/sounds/field/field-end.wav')
    };

    // Preload the audio files
    Object.values(sounds.current).forEach(audio => {
      if (audio) {
        audio.load();
      }
    });

    // Cleanup
    return () => {
      Object.values(sounds.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        const now = dayjs();
        setCurrentTime(now);

        // Check if timer should end
        if (startTime && now.diff(dayjs(startTime), 'seconds') >= MATCH_DURATION) {
          handleReset();
          if (sounds.current.end) {
            sounds.current.end.play().catch(console.error);
          }
        }

        // Check for 30 seconds remaining
        const timeLeft = dayjs(startTime).add(MATCH_DURATION, 'seconds').diff(now, 'seconds');

        if (timeLeft <= 30 && !lastTimeWarning) {
          if (sounds.current.endgame) {
            sounds.current.endgame.play().catch(console.error);
          }
          setLastTimeWarning(true);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRunning, startTime, lastTimeWarning]);

  const handleStart = () => {
    const now = dayjs();
    setCurrentTime(now);
    setStartTime(now.toDate());
    setIsRunning(true);
    setLastTimeWarning(false);
    if (sounds.current.start) {
      sounds.current.start.play().catch(console.error);
    }
  };

  const handleReset = () => {
    setStartTime(null);
    setIsRunning(false);
    setCurrentTime(dayjs());
    setLastTimeWarning(false);
  };

  const getProgressValue = () => {
    if (!startTime || !isRunning) return 0;
    const sessionEnd = dayjs(startTime).add(MATCH_DURATION, 'seconds');
    const progress = 100 - sessionEnd.diff(currentTime) / (MATCH_DURATION * 10);
    return Math.min(100, Math.max(0, progress));
  };

  const getProgressColor = () => {
    if (!startTime || !isRunning) return 'primary';
    const timeLeft = dayjs(startTime).add(MATCH_DURATION, 'seconds').diff(currentTime, 'seconds');
    if (timeLeft <= 0) return 'error';
    if (timeLeft <= 30) return 'warning'; // Warning at last 30 seconds
    return 'success';
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          flexGrow: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Stack spacing={2}>
          {isRunning && (
            <>
              <Countdown
                targetDate={dayjs(startTime).add(MATCH_DURATION, 'seconds').toDate()}
                allowNegativeValues={true}
                variant="h1"
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
            {isRunning ? 'איפוס טיימר' : 'התחל מקצה'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            LinkComponent={Link}
            href={`/scorer`}
          >
            מעבר למחשבון ניקוד
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
