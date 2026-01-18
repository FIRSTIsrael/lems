'use client';

import { IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenButton({ isFullscreen, onToggle }: FullscreenButtonProps) {
  if (isFullscreen) {
    return (
      <IconButton
        onClick={onToggle}
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            transform: 'scale(1.1)'
          }
        }}
      >
        <FullscreenExit />
      </IconButton>
    );
  }

  return (
    <IconButton
      onClick={onToggle}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme => theme.palette.action.hover,
          transform: 'scale(1.1)'
        }
      }}
    >
      <Fullscreen />
    </IconButton>
  );
}
