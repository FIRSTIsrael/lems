'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Stack,
  Paper,
  IconButton,
  Slide,
  Box,
  Fab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  DragIndicator as DragIndicatorIcon
} from '@mui/icons-material';
import { DirectionalIcon, useJudgingSessionStageTranslations } from '@lems/localization';
import { useLocale } from 'next-intl';
import { useJudgingTimer, formatTime, getJudgingStages } from '../hooks/use-judging-timer';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export const JudgingTimer = () => {
  const locale = useLocale();
  const JUDGING_STAGES = getJudgingStages(locale);

  const [isOpen, setIsOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const paperRef = useRef<HTMLDivElement>(null);
  const { getStage } = useJudgingSessionStageTranslations();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [timerState, timerControls] = useJudgingTimer();
  const { currentStage, stageTimeRemaining, totalTimeRemaining, isRunning, isFinished } =
    timerState;
  const { start, pause, resume, stop, reset, forward, back } = timerControls;

  const isReset = currentStage === 0 && stageTimeRemaining === JUDGING_STAGES[0].duration;

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else if (stageTimeRemaining === JUDGING_STAGES[currentStage].duration) {
      start();
    } else {
      resume();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable dragging on mobile devices
    if (isMobile) {
      return;
    }

    // Don't start dragging if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    if (!paperRef.current) return;

    const rect = paperRef.current.getBoundingClientRect();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: rect.left,
      offsetY: rect.top
    });
  };

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!paperRef.current) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const newLeft = dragState.offsetX + deltaX;
      const newTop = dragState.offsetY + deltaY;

      paperRef.current.style.left = `${newLeft}px`;
      paperRef.current.style.top = `${newTop}px`;
      paperRef.current.style.bottom = 'auto';
      paperRef.current.style.right = 'auto';
    };

    const handleMouseUp = () => {
      setDragState(prev => ({ ...prev, isDragging: false }));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState]);

  return (
    <>
      {!isOpen && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 1000,
            bgcolor: 'primary.main',
            color: 'white',
            transition: 'bottom 0.3s ease-in-out',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }}
          onClick={() => setIsOpen(true)}
        >
          <TimerIcon />
        </Fab>
      )}

      <Slide direction="up" in={isOpen} unmountOnExit>
        <Paper
          ref={paperRef}
          onMouseDown={handleMouseDown}
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 1001,
            width: { xs: 'calc(100vw - 32px)', sm: 380, md: 420 },
            borderRadius: 3,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: dragState.isDragging ? 'none' : 'bottom 0.3s ease-in-out',
            cursor: dragState.isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <Stack
            onMouseDown={handleMouseDown}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              color: 'grey.500',
              cursor: dragState.isDragging ? 'grabbing' : 'grab',
              '&:hover': { color: 'grey.700' },
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center'
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </Stack>

          <IconButton
            onClick={() => setIsOpen(false)}
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
              {formatTime(stageTimeRemaining)}
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                fontFamily: 'monospace',
                fontSize: { xs: '1rem', sm: '1.2rem' }
              }}
            >
              {formatTime(totalTimeRemaining)}
            </Typography>
          </Box>

          <Box width="100%" px="15%" mb={2}>
            <Box sx={{ px: 2, pb: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {JUDGING_STAGES.map((stage: { id: string; duration: number }, index: number) => {
                  let progressPercentage = 0;

                  if (index < currentStage) {
                    progressPercentage = 100;
                  } else if (index === currentStage) {
                    const timeElapsed = stage.duration - stageTimeRemaining;
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
                            index < currentStage
                              ? 'primary.main'
                              : index === currentStage
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
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {getStage(JUDGING_STAGES[currentStage].id)}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} justifyContent="center">
                <IconButton
                  disabled={currentStage === 0}
                  onClick={() => back()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                  }}
                >
                  <DirectionalIcon ltr={SkipPreviousIcon} rtl={SkipNextIcon} />
                </IconButton>

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
                  onClick={() => forward()}
                  disabled={currentStage >= JUDGING_STAGES.length - 1}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
                  }}
                >
                  <DirectionalIcon ltr={SkipNextIcon} rtl={SkipPreviousIcon} />
                </IconButton>
              </Stack>

              <Stack direction="row" spacing={1} justifyContent="center">
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
                  disabled={isRunning || isReset}
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
            </Stack>
          </Box>
        </Paper>
      </Slide>
    </>
  );
};
