'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Stack,
  Typography,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import type { Team } from '../pit-admin.graphql';

interface ArrivalsStatsProps {
  teams: Team[];
  loading?: boolean;
}

/**
 * Displays arrival statistics including total teams, arrival count,
 * percentage progress, and missing teams when arrival >= 70%
 */
export function ArrivalsStats({ teams, loading = false }: ArrivalsStatsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const t = useTranslations('components.pit-admin.stats');

  const stats = useMemo(() => {
    const total = teams.length;
    const arrived = teams.filter(t => t.arrived).length;
    const pending = total - arrived;
    const percentage = total === 0 ? 0 : Math.round((arrived / total) * 100);
    const isHighArrival = percentage >= 70;
    const missingTeams = isHighArrival ? teams.filter(t => !t.arrived).map(t => `${t.number}`) : [];

    return {
      total,
      arrived,
      pending,
      percentage,
      isHighArrival,
      missingTeams
    };
  }, [teams]);

  const getProgressColor = (percentage: number): 'success' | 'warning' | 'error' => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ height: 20, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
          <Box sx={{ height: 40, bgcolor: 'action.disabledBackground', borderRadius: 1 }} />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        boxShadow: theme.shadows[4]
      }}
    >
      <Stack spacing={3}>
        {/* Header with total teams */}
        <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="flex-start">
          <Stack flex={1} spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <GroupIcon sx={{ opacity: 0.9 }} />
              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {t('total-teams')}
              </Typography>
            </Stack>
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ fontWeight: 700 }}>
              {stats.total}
            </Typography>
          </Stack>

          {/* Arrived count and badge */}
          <Stack alignItems={isMobile ? 'flex-start' : 'center'} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircleIcon sx={{ fontSize: '1.5rem' }} />
              <Stack spacing={0}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  {t('arrived')}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stats.arrived}
                </Typography>
              </Stack>
            </Stack>
            <Chip
              label={`${stats.percentage}%`}
              size="small"
              sx={{
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)'
              }}
            />
          </Stack>
        </Stack>

        {/* Progress bar */}
        <Stack spacing={1}>
          <LinearProgress
            variant="determinate"
            value={stats.percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor:
                  getProgressColor(stats.percentage) === 'success'
                    ? '#4caf50'
                    : getProgressColor(stats.percentage) === 'warning'
                      ? '#ff9800'
                      : '#f44336',
                borderRadius: 4
              }
            }}
          />
          <Typography variant="caption" sx={{ opacity: 0.85 }}>
            {stats.pending > 0 && t('teams-pending', { count: stats.pending })}
            {stats.pending === 0 && t('all-arrived')}
          </Typography>
        </Stack>

        {/* Missing teams alert */}
        {stats.isHighArrival && stats.missingTeams.length > 0 && (
          <Box
            sx={{
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 1,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <WarningIcon sx={{ mt: 0.5, flexShrink: 0, fontSize: '1.2rem' }} />
              <Stack spacing={1} flex={1}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {t('waiting-for', { count: stats.missingTeams.length })}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    wordBreak: 'break-word',
                    opacity: 0.9
                  }}
                >
                  {stats.missingTeams.join(', ')}
                </Typography>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
