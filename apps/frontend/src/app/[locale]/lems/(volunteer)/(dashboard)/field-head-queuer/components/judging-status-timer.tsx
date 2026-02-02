'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Paper, Stack, Typography, Chip, Box, LinearProgress, Skeleton } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { type Team, type JudgingSession } from '../graphql';

interface JudgingStatusTimerProps {
  teams: Team[];
  sessions: JudgingSession[];
  currentSessionNumber: number;
  loading?: boolean;
}

export function JudgingStatusTimer({
  sessions,
  currentSessionNumber,
  loading
}: JudgingStatusTimerProps) {
  const t = useTranslations('pages.head-queuer.judging-status');

  const currentSessions = useMemo(
    () => sessions.filter(s => s.number === currentSessionNumber),
    [sessions, currentSessionNumber]
  );

  const nextSessions = useMemo(
    () => sessions.filter(s => s.number === currentSessionNumber + 1),
    [sessions, currentSessionNumber]
  );

  const currentStats = useMemo(() => {
    const total = currentSessions.length;
    const completed = currentSessions.filter(s => s.status === 'completed').length;
    const inProgress = currentSessions.filter(s => s.status === 'in-progress').length;
    const notStarted = currentSessions.filter(s => s.status === 'not-started').length;
    return { total, completed, inProgress, notStarted, progress: (completed / total) * 100 };
  }, [currentSessions]);

  const nextStats = useMemo(() => {
    const total = nextSessions.length;
    const queued = nextSessions.filter(s => s.queued).length;
    return { total, queued };
  }, [nextSessions]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={150} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <GroupsIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            {t('title')}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('current-session', { number: currentSessionNumber })}
                </Typography>
                <Chip
                  label={`${currentStats.completed}/${currentStats.total}`}
                  size="small"
                  color="primary"
                />
              </Stack>

              <LinearProgress
                variant="determinate"
                value={currentStats.progress}
                sx={{ height: 8, borderRadius: 1 }}
              />

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip
                  label={t('in-progress', { count: currentStats.inProgress })}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
                <Chip
                  label={t('not-started', { count: currentStats.notStarted })}
                  size="small"
                  color="default"
                  variant="outlined"
                />
                <Chip
                  label={t('completed', { count: currentStats.completed })}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Stack>
            </Stack>
          </Box>

          {nextSessions.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle1" fontWeight={600}>
                    {t('next-session', { number: currentSessionNumber + 1 })}
                  </Typography>
                  <Chip
                    label={`${nextStats.queued}/${nextStats.total}`}
                    size="small"
                    color="secondary"
                  />
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={(nextStats.queued / nextStats.total) * 100}
                  sx={{ height: 8, borderRadius: 1 }}
                  color="secondary"
                />

                <Typography variant="body2" color="text.secondary">
                  {t('teams-ready', { count: nextStats.queued })}
                </Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
