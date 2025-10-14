'use client';

import { useState, useEffect, useRef } from 'react';
import { Typography, Stack, Paper, IconButton, Slide, Box, Fab, Divider } from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon
} from '@mui/icons-material';
import { useTranslations, useLocale } from 'next-intl';
import { useJudgingTimer, formatTime } from '../../../../../hooks/use-judging-timer';
import { useJudgingSounds } from '../../../../../hooks/use-judging-sounds';

const JudgingTimer = () => {
  const t = useTranslations('tools.rubrics.judging-timer');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const [timerState, timerControls] = useJudgingTimer();
  const playJudgingSound = useJudgingSounds();
  const {
    currentStage,
    nextStage,
    timeRemainingInStage,
    totalTimeRemaining,
    isRunning,
    isFinished,
    currentStageIndex,
    stages
  } = timerState;

  const {
    start,
    pause,
    resume,
    stop,
    reset,
    nextStage: goToNextStage,
    restartCurrentStage
  } = timerControls;

  const prevStageIndex = useRef(currentStageIndex);
  const prevIsRunning = useRef(isRunning);
  const prevIsFinished = useRef(isFinished);

  useEffect(() => {
    if (isRunning && !prevIsRunning.current) {
      playJudgingSound('start');
    }

    if (currentStageIndex > prevStageIndex.current) {
      playJudgingSound('change');
    }
    if (isFinished && !prevIsFinished.current) {
      playJudgingSound('end');
    }

    prevStageIndex.current = currentStageIndex;
    prevIsRunning.current = isRunning;
    prevIsFinished.current = isFinished;
  }, [currentStageIndex, isRunning, isFinished, playJudgingSound]);

  const handleToggleTimer = () => {
    setIsOpen(!isOpen);
  };

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else if (timeRemainingInStage === currentStage.duration) {
      start();
    } else {
      resume();
    }
  };

  const handleNextStage = () => {
    goToNextStage();
  };

  const handleRestartStage = () => {
    restartCurrentStage();
    playJudgingSound('change');
  };

  const getCurrentStageName = () => {
    return locale === 'he' ? currentStage.nameHe : currentStage.name;
  };

  const getNextStageName = () => {
    if (!nextStage) return null;
    return locale === 'he' ? nextStage.nameHe : nextStage.name;
  };

  return (
    <>
      <Fab
        sx={{
          position: 'fixed',
          bottom: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
          zIndex: 1000,
          bgcolor: 'primary.main',
          color: 'white',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            bgcolor: 'primary.dark'
          }
        }}
        onClick={handleToggleTimer}
      >
        <TimerIcon />
      </Fab>

      <Slide direction="up" in={isOpen} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            left: { xs: 16, md: 24 },
            zIndex: 999,
            width: { xs: 'calc(100vw - 32px)', sm: 380, md: 420 },
            maxWidth: 'calc(100vw - 32px)',
            borderRadius: 3,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <IconButton
            onClick={handleToggleTimer}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'grey.600',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ p: 2, pb: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
              {t('current-stage')}: {getCurrentStageName()}
            </Typography>

            {nextStage && (
              <Typography variant="body2" color="text.secondary">
                {t('next-stage')}: {getNextStageName()}
              </Typography>
            )}
          </Box>

          <Box sx={{ px: 2, pb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              {stages.map((stage, index) => {
                let progressPercentage = 0;

                if (index < currentStageIndex) {
                  progressPercentage = 100;
                } else if (index === currentStageIndex) {
                  const timeElapsed = stage.duration - timeRemainingInStage;
                  progressPercentage = (timeElapsed / stage.duration) * 100;
                } else {
                  progressPercentage = 0;
                }

                return (
                  <Box
                    key={stage.id}
                    sx={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'grey.300',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${progressPercentage}%`,
                        bgcolor:
                          index < currentStageIndex
                            ? 'primary.main'
                            : index === currentStageIndex
                              ? 'primary.main'
                              : 'grey.300',
                        borderRadius: 2,
                        transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('stage-progress', { current: currentStageIndex + 1, total: stages.length })}
            </Typography>
          </Box>

          <Divider sx={{ mx: 2 }} />

          <Box sx={{ px: 3, py: 2, textAlign: 'center' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '2.5rem', sm: '3rem' },
                fontFamily: 'monospace',
                letterSpacing: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'color 0.3s ease-in-out'
              }}
            >
              {formatTime(timeRemainingInStage)}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
              {t('stage-time-remaining')}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                mt: 1,
                fontFamily: 'monospace',
                fontSize: { xs: '1rem', sm: '1.2rem' }
              }}
            >
              {formatTime(totalTimeRemaining)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {t('total-time-remaining')}
            </Typography>
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
              <IconButton
                onClick={handlePlayPause}
                disabled={isFinished}
                sx={{
                  bgcolor: isRunning ? 'warning.main' : 'success.main',
                  color: 'white',
                  '&:hover': { bgcolor: isRunning ? 'warning.dark' : 'success.dark' },
                  '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                }}
              >
                {isRunning ? <PauseIcon /> : <PlayIcon />}
              </IconButton>

              <IconButton
                onClick={stop}
                disabled={isFinished || !isRunning}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'error.dark' },
                  '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                }}
              >
                <StopIcon />
              </IconButton>

              <IconButton
                onClick={reset}
                disabled={isRunning}
                sx={{
                  bgcolor: 'grey.600',
                  color: 'white',
                  '&:hover': { bgcolor: 'grey.700' },
                  '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="center">
              <IconButton
                onClick={handleRestartStage}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <SkipPreviousIcon />
              </IconButton>

              <IconButton
                onClick={handleNextStage}
                disabled={currentStageIndex >= stages.length - 1}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                }}
              >
                <SkipNextIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};

export default JudgingTimer;
