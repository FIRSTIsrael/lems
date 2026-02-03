'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Checkbox,
  Tooltip,
  Stack,
  Chip,
  Box,
  Typography,
  Skeleton
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  UPDATE_SESSION_MUTATION,
  type Team,
  type RobotGameMatch,
  type JudgingRoom,
  type JudgingSession
} from '../graphql';

interface JudgingScheduleProps {
  divisionId: string;
  teams: Team[];
  sessions: JudgingSession[];
  rooms: JudgingRoom[];
  matches: RobotGameMatch[];
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
  loading?: boolean;
}

export function JudgingSchedule({
  divisionId,
  teams,
  sessions,
  rooms,
  matches,
  activeMatch,
  loadedMatch,
  loading
}: JudgingScheduleProps) {
  const t = useTranslations('pages.head-queuer.judging-schedule');

  const [updateSessionMutation] = useMutation(UPDATE_SESSION_MUTATION, {
    onError: () => toast.error(t('error.update-session-failed'))
  });

  const handleCallSessions = useCallback(
    async (sessionNumber: number, called: boolean) => {
      const sessionsToCall = sessions.filter(s => s.number === sessionNumber);
      await Promise.all(
        sessionsToCall.map(session =>
          updateSessionMutation({
            variables: { divisionId, sessionId: session.id, called }
          })
        )
      );
    },
    [divisionId, sessions, updateSessionMutation]
  );

  const handleToggleSession = useCallback(
    async (sessionId: string, queued: boolean) => {
      await updateSessionMutation({
        variables: { divisionId, sessionId, queued }
      });
    },
    [divisionId, updateSessionMutation]
  );

  const availableSessionGroups = useMemo(() => {
    const now = dayjs();

    const groups: Record<number, JudgingSession[]> = {};
    sessions.forEach(session => {
      if (!groups[session.number]) {
        groups[session.number] = [];
      }
      groups[session.number].push(session);
    });

    return Object.values(groups).filter(
      group =>
        group.length > 0 &&
        !group.some(s => s.status === 'completed') &&
        group.some(s => s.status === 'not-started') &&
        dayjs(group[0].scheduledTime).subtract(20, 'minutes').isBefore(now)
    );
  }, [sessions]);

  const getTeamById = useCallback((teamId: string) => teams.find(t => t.id === teamId), [teams]);

  const getRoomById = useCallback((roomId: string) => rooms.find(r => r.id === roomId), [rooms]);

  const isTeamOnField = useCallback(
    (teamId: string) => {
      if (activeMatch?.participants.some(p => p.team?.id === teamId)) return true;
      if (loadedMatch?.participants.some(p => p.team?.id === teamId)) return true;

      return matches
        .filter(m => m.called && m.status === 'not-started')
        .some(m => m.participants.some(p => p.team?.id === teamId && p.queued));
    },
    [matches, activeMatch, loadedMatch]
  );

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} />
      </Paper>
    );
  }

  if (availableSessionGroups.length === 0) {
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
    <TableContainer component={Paper}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">{t('title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('subtitle')}
        </Typography>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              {t('session-number')}
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{t('time')}</TableCell>
            {rooms.map(room => (
              <TableCell key={room.id} align="center" sx={{ fontWeight: 600 }}>
                {room.name}
              </TableCell>
            ))}
            <TableCell sx={{ fontWeight: 600 }}>{t('actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {availableSessionGroups.map((group, index) => {
            const firstSession = group[0];
            return (
              <TableRow
                key={index}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  bgcolor: firstSession.called ? 'action.hover' : 'inherit'
                }}
              >
                <TableCell component="th" scope="row" align="center">
                  <Chip label={firstSession.number} size="small" color="primary" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {dayjs(firstSession.scheduledTime).format('HH:mm')}
                  </Typography>
                </TableCell>
                {group.map(session => {
                  const team = getTeamById(session.teamId);
                  const room = getRoomById(session.roomId);
                  const teamOnField = team ? isTeamOnField(team.id) : false;

                  return (
                    <TableCell key={room?.id || session.id} align="center">
                      <Stack spacing={1} alignItems="center" justifyContent="center">
                        {team && (
                          <Tooltip title={`${team.number} - ${team.name}`} arrow>
                            <Chip
                              label={team.number}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </Tooltip>
                        )}
                        {team && session.called && (
                          <>
                            {teamOnField ? (
                              <Tooltip title={t('team-on-field')} arrow>
                                <WarningAmberRoundedIcon color="warning" fontSize="small" />
                              </Tooltip>
                            ) : (
                              <Checkbox
                                checked={session.queued}
                                disabled={!team.arrived}
                                size="small"
                                onChange={() => handleToggleSession(session.id, !session.queued)}
                              />
                            )}
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    color={firstSession.called ? 'error' : 'primary'}
                    onClick={() => handleCallSessions(firstSession.number, !firstSession.called)}
                    sx={{ minWidth: 80 }}
                  >
                    {firstSession.called ? t('cancel') : t('call')}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
