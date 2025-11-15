'use client';

import { Box, Typography, Paper, Stack, Fade, alpha } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface CompletedStepSummaryProps {
  label: string;
  value: string;
  color?: string;
  onStepClick?: () => void;
}

export function CompletedStepSummary({
  label,
  value,
  color,
  onStepClick
}: CompletedStepSummaryProps) {
  return (
    <Fade in timeout={500}>
      <Paper
        elevation={0}
        onClick={onStepClick}
        sx={{
          p: 2,
          mb: 2,
          background: theme =>
            `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
          border: theme => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          cursor: onStepClick ? 'pointer' : 'default',
          '&:hover': {
            background: theme =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.08)} 100%)`,
            transform: onStepClick ? 'translateY(-1px)' : 'none',
            boxShadow: onStepClick
              ? theme => `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
              : 'none'
          }
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <CheckCircle
            sx={{
              color: 'primary.main',
              fontSize: '1.25rem'
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}
            >
              {label}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
              {color && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                    boxShadow: `0 0 0 2px ${alpha(color, 0.2)}`
                  }}
                />
              )}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                {value}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Fade>
  );
}
