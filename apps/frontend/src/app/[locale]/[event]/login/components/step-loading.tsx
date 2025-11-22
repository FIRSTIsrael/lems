'use client';

import { Box, CircularProgress, Typography, alpha } from '@mui/material';
import { useTranslations } from 'next-intl';

interface StepLoadingProps {
  message?: string;
}

export function StepLoading({ message }: StepLoadingProps) {
  const t = useTranslations('pages.login');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 4,
        minHeight: 300
      }}
    >
      <Box
        sx={{
          position: 'relative',
          mb: 3
        }}
      >
        {/* Outer glow ring */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: theme =>
              `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)'
              },
              '50%': {
                opacity: 0.6,
                transform: 'translate(-50%, -50%) scale(1.1)'
              }
            }
          }}
        />

        {/* Spinner */}
        <CircularProgress
          size={48}
          thickness={3}
          sx={{
            color: 'primary.main',
            filter: theme => `drop-shadow(0 2px 8px ${alpha(theme.palette.primary.main, 0.3)})`
          }}
        />
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontWeight: 500,
          textAlign: 'center',
          animation: 'fadeIn 0.5s ease-in',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 }
          }
        }}
      >
        {message || t('loading')}
      </Typography>
    </Box>
  );
}
