'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tooltip,
  Chip,
  Box,
  Typography,
  Skeleton,
  Checkbox
} from '@mui/material';
import { useTime } from '../../../../../../../lib/time/hooks/use-time';
import { UPDATE_JUDGING_SESSION_MUTATION, type JudgingSession, type JudgingRoom } from '../graphql';
import { GET_HEAD_QUEUER_DATA } from '../graphql/query';

interface JudgingScheduleProps {
  divisionId: string;
  sessions: JudgingSession[];
  rooms: JudgingRoom[];
  loading?: boolean;
}

export function JudgingSchedule({ divisionId, sessions, rooms, loading }: JudgingScheduleProps) {
  const t = useTranslations('pages.judging-head-queuer.judging-schedule');
  const currentTime = useTime({ interval: 1000 });

  const [updateSessionMutation] = useMutation(UPDATE_JUDGING_SESSION_MUTATION, {
    refetchQueries: [{ query: GET_HEAD_QUEUER_DATA, variables: { divisionId } }],
    awaitRefetchQueries: true
  });

  const handleCallTimeSlot = useCallback(
    async (sessionIds: string[], called: boolean) => {
      try {
        await Promise.all(
          sessionIds.map(sessionId =>
            updateSessionMutation({
              variables: { divisionId, sessionId, called }
            })
          )
        );
        toast.success(called ? t('call') : t('cancel'));
      } catch {
        toast.error(t('error.update-session-failed'));
      }
    },
    [divisionId, updateSessionMutation, t]
  );

  const handleToggleQueued = useCallback(
    async (sessionId: string, queued: boolean) => {
      try {
        await updateSessionMutation({
          variables: { divisionId, sessionId, queued }
        });
      } catch {
        toast.error(t('error.update-session-failed'));
      }
    },
    [divisionId, updateSessionMutation, t]
  );

  // Group sessions by time slot and room
  const timeSlots = useMemo(() => {
    const slots = new Map<string, Map<string, JudgingSession>>();

    sessions
      .filter(
        session =>
          session.status === 'not-started' &&
          currentTime.diff(session.scheduledTime, 'minute') >= -20
      )
      .forEach(session => {
        const timeKey = session.scheduledTime;
        if (!slots.has(timeKey)) {
          slots.set(timeKey, new Map());
        }
        if (session.room) {
          slots.get(timeKey)!.set(session.room.id, session);
        }
      });

    return Array.from(slots.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, roomSessions]) => ({ time, roomSessions }));
  }, [sessions, currentTime]);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('no-sessions')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('no-sessions-description')}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0, bgcolor: 'white' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{t('title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table
          size="small"
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            minWidth: Math.max(400, 100 + rooms.length * 150)
          }}
        >
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell width={80} align="center">
                <Typography fontWeight={600}>{t('time')}</Typography>
              </TableCell>
              {rooms.map(room => (
                <TableCell key={room.id} align="center">
                  <Typography fontWeight={600}>{room.name}</Typography>
                </TableCell>
              ))}
              <TableCell width={100} align="center">
                <Typography fontWeight={600}>{t('actions')}</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(({ time, roomSessions }) => {
              const allSessions = Array.from(roomSessions.values());
              const allCalled = allSessions.length > 0 && allSessions.every(s => s.called);
              const sessionIds = allSessions.map(s => s.id);

              return (
                <TableRow key={time}>
                  <TableCell align="center">
                    <Typography fontFamily="monospace" fontWeight={500}>
                      {currentTime
                        .set('hour', new Date(time).getHours())
                        .set('minute', new Date(time).getMinutes())
                        .format('HH:mm')}
                    </Typography>
                  </TableCell>
                  {rooms.map(room => {
                    const session = roomSessions.get(room.id);
                    if (!session) {
                      return (
                        <TableCell key={room.id} align="center">
                          <Typography color="text.disabled">-</Typography>
                        </TableCell>
                      );
                    }

                    const team = session.team;
                    const isSignedIn = team?.arrived ?? false;

                    return (
                      <TableCell key={room.id} align="center">
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                            alignItems: 'center'
                          }}
                        >
                          {team ? (
                            <Tooltip title={`${team.number} - ${team.name}`} arrow>
                              <Typography component="span" sx={{ fontSize: '0.875rem' }}>
                                #{team.number}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography color="text.disabled" sx={{ fontSize: '0.875rem' }}>
                              —
                            </Typography>
                          )}
                          {team && !isSignedIn && (
                            <Chip
                              label={t('status.not_signed_in')}
                              size="small"
                              color="error"
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          )}
                          {session.called && team && (
                            <Tooltip title={t('queued')} arrow>
                              <Checkbox
                                checked={session.queued}
                                onChange={e => handleToggleQueued(session.id, e.target.checked)}
                                size="small"
                                sx={{ padding: 0.5 }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      color={allCalled ? 'error' : 'primary'}
                      onClick={() => handleCallTimeSlot(sessionIds, !allCalled)}
                      sx={{ minWidth: 80 }}
                    >
                      {allCalled ? t('cancel') : t('call')}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
