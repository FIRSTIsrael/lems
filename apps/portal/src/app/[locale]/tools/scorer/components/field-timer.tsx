'use client';

import { useState, useContext, useRef, useEffect } from 'react';
import { Typography, Stack, Paper, IconButton, Slide, Fab } from '@mui/material';
import {
  Timer as TimerIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useFieldTimer } from '../hooks/use-field-timer';
import { MissionContext } from './mission-context';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export const FieldTimer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  });
  const paperRef = useRef<HTMLDivElement>(null);

  const { points } = useContext(MissionContext);
  const scoreFloaterShown = Boolean(points);

  const [timerState, timerControls] = useFieldTimer();
  const { timeRemaining, isRunning, matchLength } = timerState;
  const isReset = timeRemaining === matchLength;
  const justStarted = isRunning && isReset;
  const isFinished = timeRemaining === 0;

  const { start, pause, resume, stop, reset } = timerControls;

  const handlePlayPause = () => {
    if (isRunning) {
      pause();
    } else if (isReset) {
      start();
    } else {
      resume();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
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
            bottom: scoreFloaterShown ? { xs: 90, md: 24 } : { xs: 16, md: 24 },
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
            bottom: scoreFloaterShown ? { xs: 90, md: 24 } : { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            zIndex: 1001,
            width: { xs: 'calc(100vw - 32px)', sm: 320, md: 360 },
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
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DragIcon fontSize="small" />
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

          <Stack
            sx={{ px: 3, py: 2, textAlign: 'center' }}
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '2.5rem', sm: '3rem' },
                fontFamily: 'monospace',
                letterSpacing: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1.5 }}>
              <IconButton
                onClick={handlePlayPause}
                disabled={isFinished || justStarted}
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
                onClick={() => stop()}
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
                onClick={() => reset()}
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
        </Paper>
      </Slide>
    </>
  );
};
