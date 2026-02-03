'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Paper, Stack, Typography, Chip, Skeleton, Button, Checkbox, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { UPDATE_JUDGING_SESSION_MUTATION, type JudgingSession } from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';

interface CurrentSessionsDisplayProps {
  divisionId: string;
  currentSessions: JudgingSession[];
  upcomingSessions: JudgingSession[];
  loading?: boolean;
}

export function CurrentSessionsDisplay({
  divisionId,
  currentSessions,
  upcomingSessions,
  loading
}: CurrentSessionsDisplayProps) {
  const t = useTranslations('pages.judging-head-queuer.current-sessions');

  const [updateSessionMutation] = useMutation(UPDATE_JUDGING_SESSION_MUTATION, {
    onError: () => toast.error(t('error.update-session-failed')),
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const handleToggleQueued = useCallback(
    async (sessionId: string, queued: boolean) => {
      await updateSessionMutation({
        variables: { divisionId, sessionId, queued }
      });
    },
    [divisionId, updateSessionMutation]
  );

  const handleCallTimeSlot = useCallback(
    async (sessionIds: string[], called: boolean) => {
      await Promise.all(
        sessionIds.map(sessionId =>
          updateSessionMutation({
            variables: { divisionId, sessionId, called }
          })
        )
      );
    },
    [divisionId, updateSessionMutation]
  );

  // Get the next time slot (first upcoming session group)
  const nextTimeSlot = upcomingSessions.length > 0 ? upcomingSessions[0] : null;
  const nextTimeSlotSessions = nextTimeSlot
    ? upcomingSessions.filter(s => s.scheduledTime === nextTimeSlot.scheduledTime)
    : [];

  if (loading) {
    return (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ flex: 1, borderRadius: 1 }} />
      </Stack>
    );
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: currentSessions.length > 0 ? 'success.main' : 'action.disabledBackground',
          color: currentSessions.length > 0 ? 'success.contrastText' : 'text.secondary'
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PlayArrowIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('current-sessions')}
            </Typography>
          </Stack>
          {currentSessions.length > 0 ? (
            <Stack spacing={1}>
              {currentSessions.map(session => (
                <Stack
                  key={session.id}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'rgba(255,255,255,0.08)'
                  }}
                >
                  <Chip
                    label={`${t('session')} ${session.number}`}
                    size="small"
                    sx={{
                      bgcolor: 'success.dark',
                      color: 'success.contrastText',
                      fontWeight: 600
                    }}
                  />
                  {session.room && (
                    <Chip
                      label={session.room.name}
                      size="small"
                      sx={{
                        bgcolor: 'success.dark',
                        color: 'success.contrastText'
                      }}
                    />
                  )}
                  {session.team && (
                    <Chip
                      label={`#${session.team.number}`}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(255,255,255,0.6)',
                        color: 'success.contrastText',
                        fontWeight: 600
                      }}
                    />
                  )}
                  {session.startTime && (
                    <Typography variant="body2">
                      {t('started-at', {
                        time: dayjs(session.startTime).format('HH:mm:ss')
                      })}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2">{t('no-current-sessions')}</Typography>
          )}
        </Stack>
      </Paper>

      <Paper
        sx={{
          flex: 1,
          p: 3,
          bgcolor: nextTimeSlot ? 'primary.main' : 'action.disabledBackground',
          color: nextTimeSlot ? 'primary.contrastText' : 'text.secondary'
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ScheduleIcon />
            <Typography variant="h6" fontWeight={600}>
              {t('upcoming-sessions')}
            </Typography>
          </Stack>
          {nextTimeSlot ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                sx={{ justifyContent: 'space-between' }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <Chip
                    label={dayjs(nextTimeSlot.scheduledTime).format('HH:mm')}
                    size="medium"
                    sx={{
                      bgcolor: 'primary.dark',
                      color: 'primary.contrastText',
                      fontWeight: 600,
                      fontSize: '1rem'
                    }}
                  />
                  <Typography variant="body2">
                    {t('round')} {nextTimeSlotSessions[0]?.number}
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  size="medium"
                  color={nextTimeSlot.called ? 'error' : 'success'}
                  onClick={() =>
                    handleCallTimeSlot(
                      nextTimeSlotSessions.map(s => s.id),
                      !nextTimeSlot.called
                    )
                  }
                  sx={{ minWidth: 120 }}
                >
                  {nextTimeSlot.called ? t('cancel-call') : t('call-teams')}
                </Button>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  {t('teams')}
                </Typography>
                <Stack spacing={1}>
                  {nextTimeSlotSessions
                    .slice()
                    .sort((a, b) => (a.room?.name || '').localeCompare(b.room?.name || ''))
                    .map(session => {
                      const isQueued = session.queued;
                      const isSignedIn = session.team?.arrived ?? false;
                      const teamNumber = session.team?.number ?? '—';
                      const roomName = session.room?.name ?? '—';
                      const teamId = session.team?.id ?? null;

                      const statusKey = !session.team
                        ? 'empty-room'
                        : !isSignedIn
                          ? 'not_signed_in'
                          : isQueued
                            ? 'queued'
                            : 'not-queued';

                      const statusChip =
                        statusKey === 'queued'
                          ? { color: 'success' as const, variant: 'filled' as const }
                          : statusKey === 'not_signed_in'
                            ? { color: 'error' as const, variant: 'filled' as const }
                            : statusKey === 'not-queued'
                              ? { color: 'warning' as const, variant: 'filled' as const }
                              : { color: 'default' as const, variant: 'outlined' as const };

                      return (
                        <Stack
                          key={session.id}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'rgba(255,255,255,0.08)'
                          }}
                        >
                          <Chip
                            label={roomName}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.14)',
                              color: 'primary.contrastText'
                            }}
                          />
                          <Chip
                            label={teamNumber}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: 'rgba(255,255,255,0.6)',
                              color: 'primary.contrastText',
                              fontWeight: 600
                            }}
                          />
                          <Chip
                            label={t(`status.${statusKey}`)}
                            size="small"
                            color={statusChip.color}
                            variant={statusChip.variant}
                            sx={
                              statusChip.variant === 'outlined'
                                ? {
                                    borderColor: 'rgba(255,255,255,0.6)',
                                    color: 'primary.contrastText'
                                  }
                                : undefined
                            }
                          />

                          {teamId && (
                            <Tooltip
                              title={
                                !isSignedIn
                                  ? t('mark-disabled-not-signed-in')
                                  : isQueued
                                    ? t('unmark-queued')
                                    : t('mark-queued')
                              }
                              arrow
                            >
                              <span>
                                <Checkbox
                                  checked={isQueued}
                                  disabled={!isSignedIn}
                                  onChange={() => handleToggleQueued(session.id, !isQueued)}
                                  sx={{
                                    color: 'rgba(255,255,255,0.75)',
                                    '&.Mui-checked': { color: 'success.light' }
                                  }}
                                />
                              </span>
                            </Tooltip>
                          )}
                        </Stack>
                      );
                    })}
                </Stack>
              </Stack>
            </>
          ) : (
            <Typography variant="body2">{t('no-upcoming-sessions')}</Typography>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
