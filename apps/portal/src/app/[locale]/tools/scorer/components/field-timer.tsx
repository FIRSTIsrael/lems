'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { Typography, Stack, Paper, IconButton, Slide, Box, Fab, Chip } from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useFieldTimer, formatTime } from '../../../../../hooks/use-field-timer';
import { useTimerSounds } from '../../../../../hooks/use-timer-sounds';
import { MissionContext } from './mission-context';

const FieldTimer = () => {
  const t = useTranslations('pages.tools.scorer.field-timer');
  const { points } = useContext(MissionContext);
  const [isOpen, setIsOpen] = useState(false);

  // 2:30m -> 150s
  const [timerState, timerControls] = useFieldTimer(150);
  const { timeRemaining, isRunning, isFinished, totalTime } = timerState;
  const { playStartSound, playEndgameSound, playEndSound } = useTimerSounds();

  const scoreFloaterShown = Boolean(points);
  const { start, pause, resume, stop, reset } = timerControls;

  const prevTimeRef = useRef(timeRemaining);
  const prevRunningRef = useRef(isRunning);

  useEffect(() => {
    const prevTime = prevTimeRef.current;
    const prevRunning = prevRunningRef.current;

    if (!prevRunning && isRunning && timeRemaining === totalTime) {
      playStartSound();
    }
    if (isRunning && timeRemaining === 30 && prevTime === 31) {
      playEndgameSound();
    }
    if (timeRemaining === 0 && prevTime === 1) {
      playEndSound();
    }

    prevTimeRef.current = timeRemaining;
    prevRunningRef.current = isRunning;
  }, [timeRemaining, isRunning, totalTime, playStartSound, playEndgameSound, playEndSound]);

  const handleToggleTimer = () => {
    setIsOpen(!isOpen);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else if (timeRemaining === totalTime) {
      start();
    } else {
      resume();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleReset = () => {
    reset();
  };

  const getTimerColor = () => {
    if (isFinished) return 'error.main';
    if (timeRemaining <= 30) return 'warning.main';
    return 'primary.main';
  };

  return (
    <>
      {/*Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: scoreFloaterShown ? { xs: 90, md: 94 } : { xs: 16, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          bgcolor: 'primary.main',
          color: 'white',
          transition: 'bottom 0.3s ease-in-out',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
        onClick={handleToggleTimer}
      >
        <TimerIcon />
      </Fab>

      {/*Timer Panel */}
      <Slide direction="up" in={isOpen} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: scoreFloaterShown ? { xs: 90, md: 94 } : { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 999,
            width: { xs: 'calc(100vw - 32px)', sm: 320, md: 360 },
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: 3,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'bottom 0.3s ease-in-out'
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              pb: 0,
              background: `linear-gradient(45deg, ${getTimerColor()} 30%, ${getTimerColor()}80 90%)`,
              color: 'white'
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              {t('title')}
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }} onClick={handleToggleTimer}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          {/* Field Timer Header */}
          <Box sx={{ px: 3, pb: 1, mt: -5, textAlign: 'center' }}>
            <Typography variant="h6" color="text.primary" fontWeight={700}>
              {t('title')}
            </Typography>
          </Box>

          {/* Progress Bar */}
          {/* <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getTimerColor()
              }
            }}
          /> */}

          {/* Timer Display */}
          <Box sx={{ px: 3, py: 2, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: getTimerColor(),
                fontSize: { xs: '2.5rem', sm: '3rem' },
                fontFamily: 'monospace',
                letterSpacing: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>

            {isFinished && (
              <Chip
                label={t('finished')}
                color="error"
                variant="filled"
                sx={{ mt: 1, fontWeight: 600 }}
              />
            )}
          </Box>

          {/* Controls */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ px: 2, pb: 2, pt: 1 }}>
            <IconButton
              onClick={handlePlayPause}
              disabled={isFinished}
              sx={{
                bgcolor: isRunning ? 'warning.main' : 'success.main',
                color: 'white',
                '&:hover': {
                  bgcolor: isRunning ? 'warning.dark' : 'success.dark'
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500'
                }
              }}
            >
              {isRunning ? <PauseIcon /> : <PlayIcon />}
            </IconButton>

            <IconButton
              onClick={handleStop}
              disabled={timeRemaining === totalTime}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark'
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                  color: 'grey.500'
                }
              }}
            >
              <StopIcon />
            </IconButton>

            <IconButton
              onClick={handleReset}
              sx={{
                bgcolor: 'grey.600',
                color: 'white',
                '&:hover': {
                  bgcolor: 'grey.700'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Slide>
    </>
  );
};

export default FieldTimer;
