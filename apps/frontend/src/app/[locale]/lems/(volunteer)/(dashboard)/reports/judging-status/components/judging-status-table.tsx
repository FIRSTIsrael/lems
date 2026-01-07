'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs, { Dayjs } from 'dayjs';
import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { JudgingSession, Room } from '../graphql';
import { TeamInfo } from '../../../components/team-info';

interface JudgingStatusTableProps {
  currentSessions: JudgingSession[];
  nextSessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
  loading: boolean;
  currentTime: Dayjs;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'info';
    case 'not-started':
      return 'default';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string, called: boolean) => {
  if (status === 'completed') {
    return <CheckCircleRoundedIcon fontSize="small" />;
  }
  if (status === 'in-progress') {
    return <PlayCircleRoundedIcon fontSize="small" />;
  }
  if (called) {
    return <PeopleAltRoundedIcon fontSize="small" />;
  }
  return <RadioButtonUncheckedRoundedIcon fontSize="small" />;
};

export const JudgingStatusTable: React.FC<JudgingStatusTableProps> = ({
  currentSessions,
  nextSessions,
  rooms,
  sessionLength,
  loading,
  currentTime
}) => {
  const t = useTranslations('pages.judging-status');

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((a, b) => a.name.localeCompare(b.name));
  }, [rooms]);

  if (loading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('table.time')}</TableCell>
              {sortedRooms.map(room => (
                <TableCell key={room.id} align="center" sx={{ fontWeight: 600 }}>
                  {t('table.room', { name: room.name })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2].map(row => (
              <TableRow key={row}>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                {sortedRooms.map(room => (
                  <TableCell key={room.id} align="center">
                    <Skeleton variant="rectangular" height={60} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (currentSessions.length === 0 && nextSessions.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {t('empty-state.message')}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: theme => theme.shadows[2]
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>{t('table.time')}</TableCell>
            {sortedRooms.map(room => (
              <TableCell key={room.id} align="center" sx={{ fontWeight: 600, minWidth: 200 }}>
                {t('table.room', { name: room.name })}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {currentSessions.length > 0 && (
            <TableRow
              sx={{
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' }
              }}
            >
              <TableCell component="th" sx={{ verticalAlign: 'top', py: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('table.current-round')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentTime
                      .hour(dayjs(currentSessions[0].scheduledTime).hour())
                      .minute(dayjs(currentSessions[0].scheduledTime).minute())
                      .format('HH:mm')}
                  </Typography>
                </Stack>
              </TableCell>
              {sortedRooms.map(room => {
                const session = currentSessions.find(s => s.room.id === room.id);
                const team = session?.team;

                return (
                  <TableCell key={room.id} align="center" sx={{ verticalAlign: 'top', py: 2 }}>
                    {session && team ? (
                      <Stack spacing={1} alignItems="center">
                        <Box sx={{ minWidth: 180 }}>
                          <TeamInfo team={team} size="sm" textAlign="center" />
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                          <Chip
                            icon={getStatusIcon(session.status, session.called)}
                            label={t(`status.${session.status}`)}
                            color={getStatusColor(session.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                          {!team.arrived && (
                            <Chip
                              icon={<WarningAmberRoundedIcon />}
                              label={t('not-arrived')}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                        {session.startTime && session.startDelta !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            {t('table.started-at', {
                              time: currentTime
                                .hour(dayjs(session.startTime).hour())
                                .minute(dayjs(session.startTime).minute())
                                .format('HH:mm')
                            })}
                            {session.startDelta !== 0 && (
                              <Typography
                                component="span"
                                variant="caption"
                                color={session.startDelta > 0 ? 'error' : 'success.main'}
                                sx={{ ml: 0.5 }}
                              >
                                ({session.startDelta > 0 ? '+' : ''}
                                {Math.round(session.startDelta / 1000)}s)
                              </Typography>
                            )}
                          </Typography>
                        )}

                        {session.status === 'in-progress' && session.startTime && (
                          <Typography variant="caption" color="text.secondary">
                            {t('table.ends-at', {
                              time: currentTime
                                .hour(dayjs(session.startTime).hour())
                                .minute(dayjs(session.startTime).minute())
                                .add(sessionLength, 'seconds')
                                .format('HH:mm')
                            })}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          )}

          {nextSessions.length > 0 && (
            <TableRow
              sx={{
                '&:hover': { bgcolor: 'grey.50' }
              }}
            >
              <TableCell component="th" sx={{ verticalAlign: 'top', py: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t('table.next-round')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {currentTime
                      .hour(dayjs(nextSessions[0].scheduledTime).hour())
                      .minute(dayjs(nextSessions[0].scheduledTime).minute())
                      .format('HH:mm')}
                  </Typography>
                </Stack>
              </TableCell>
              {sortedRooms.map(room => {
                const session = nextSessions.find(s => s.room.id === room.id);
                const team = session?.team;

                return (
                  <TableCell key={room.id} align="center" sx={{ verticalAlign: 'top', py: 2 }}>
                    {session && team ? (
                      <Stack spacing={1} alignItems="center">
                        <Box sx={{ minWidth: 180 }}>
                          <TeamInfo team={team} size="sm" textAlign="center" />
                        </Box>

                        <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                          {session.called && (
                            <Chip
                              icon={<PeopleAltRoundedIcon fontSize="small" />}
                              label={t('status.queued')}
                              color="warning"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          {!team.arrived && (
                            <Chip
                              icon={<WarningAmberRoundedIcon />}
                              label={t('not-arrived')}
                              color="warning"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        —
                      </Typography>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
