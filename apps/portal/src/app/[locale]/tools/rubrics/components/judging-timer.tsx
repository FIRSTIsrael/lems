'use client';

import React, { useState, useRef } from 'react';
import { Typography, Stack, Paper, IconButton, Slide, Box, Fab } from '@mui/material';
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
import { useJudgingTimer, formatTime, JUDGING_STAGES } from '../hooks/use-judging-timer';

const JudgingTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const paperRef = useRef<HTMLDivElement>(null);
  const { getStage } = useJudgingSessionStageTranslations();

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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Prevent dragging if clicking on a button, icon, or input element
    if (target.closest('button, [role="button"], input, svg')) {
      return;
    }

    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (paperRef.current) {
      const rect = paperRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top
      });
    }
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    setPosition({
      x: clientX - dragOffset.x,
      y: clientY - dragOffset.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Attach drag listeners when dragging
  React.useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragOffset]);

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
          elevation={8}
          sx={{
            position: 'fixed',
            left: position.x !== 0 ? `${position.x}px` : 'auto',
            top: position.y !== 0 ? `${position.y}px` : 'auto',
            bottom: position.x === 0 && position.y === 0 ? { xs: 16, md: 24 } : 'auto',
            right: position.x === 0 && position.y === 0 ? { xs: 16, md: 24 } : 'auto',
            zIndex: 1001,
            width: { xs: 'calc(100vw - 32px)', sm: 380, md: 420 },
            borderRadius: 3,
            overflow: 'hidden',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            transition: isDragging ? 'none' : 'bottom 0.3s ease-in-out',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            <IconButton
              data-drag-handle
              size="small"
              sx={{
                cursor: 'grab',
                '&:active': { cursor: 'grabbing' },
                color: 'grey.400',
                '&:hover': { bgcolor: 'grey.100', color: 'grey.600' }
              }}
            >
              <DragIndicatorIcon />
            </IconButton>

            <Box flex={1} />

            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{
                color: 'grey.600',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

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
                {JUDGING_STAGES.map((stage, index) => {
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

export { JudgingTimer };
