'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Typography, LinearProgress, Stack, Box, useTheme, Chip } from '@mui/material';
import { useMatchTranslations } from '@lems/localization';
import { Match } from '../scorekeeper.graphql';
import { useScorekeeperData } from '../scorekeeper-context';

interface CurrentMatchDisplayProps {
  match?: Match | null;
  matchLength?: number;
  elapsedTime?: number;
  actualStartDelay?: string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function CurrentMatchDisplay({
  match: propMatch,
  matchLength: propMatchLength,
  elapsedTime = 0
}: CurrentMatchDisplayProps) {
  const t = useTranslations('pages.scorekeeper.current-match');
  const { getStage } = useMatchTranslations();
  const theme = useTheme();

  // Use context values if props are not provided
  const contextData = useScorekeeperData();
  const match = propMatch ?? contextData.currentMatch;
  const matchLength = propMatchLength ?? contextData.matchLength;

  const progressPercent = useMemo(() => {
    return (elapsedTime / matchLength) * 100;
  }, [elapsedTime, matchLength]);

  const timeRemaining = useMemo(() => {
    return Math.max(0, matchLength - elapsedTime);
  }, [elapsedTime, matchLength]);

  const getProgressColor = () => {
    if (progressPercent < 50) return 'success';
    if (progressPercent < 80) return 'warning';
    return 'error';
  };

  const isTimeUrgent = timeRemaining <= 30;

  if (!match) {
    return (
      <Paper
        sx={{
          p: 1.5,
          textAlign: 'center',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="caption" color="textSecondary">
          {t('no-match')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 1.75,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
        <Stack sx={{ mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              color: 'text.primary'
            }}
          >
            {getStage(match.stage)} #{match.number}
          </Typography>
          {match.round && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.25 }}>
              {t('round')} {match.round}
            </Typography>
          )}
        </Stack>

        {/* Time Progress Section */}
        <Stack spacing={0.75} sx={{ mb: 1.5, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: 0.5
              }}
            >
              {t('time-remaining')}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: isTimeUrgent ? theme.palette.warning.main : theme.palette.success.main
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={progressPercent}
            color={getProgressColor()}
            sx={{
              height: 6,
              borderRadius: 1,
              backgroundColor: theme.palette.action.hover,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1
              }
            }}
          />
        </Stack>
      </Stack>

      {/* Compact Teams Section */}
      <Stack spacing={0.75} sx={{ flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            textTransform: 'uppercase',
            fontSize: '0.7rem',
            letterSpacing: 0.5
          }}
        >
          Teams
        </Typography>

        <Stack spacing={0.5}>
          {match.participants.map((participant, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 0.75,
                bgcolor: 'action.hover',
                borderRadius: 0.75,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.selected'
                }
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  T{participant.team?.number || '?'} · {participant.team?.name || 'Unknown'}
                </Typography>
              </Box>

              <Chip
                label={participant.table?.name || 'Unknown'}
                variant="filled"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  marginLeft: 1,
                  flexShrink: 0
                }}
              />
            </Box>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
