'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Box,
  Skeleton,
  Tooltip
} from '@mui/material';
import { useTime } from '../../../../../../../lib/time/hooks/use-time';
import type { JudgingQueuerData, JudgingSession } from '../graphql';

interface JudgingScheduleViewProps {
  data: JudgingQueuerData;
  loading?: boolean;
}

export function JudgingScheduleView({ data, loading }: JudgingScheduleViewProps) {
  const t = useTranslations('pages.judging-queuer.schedule-view');
  const currentTime = useTime({ interval: 1000 });

  // Group sessions by time slot and room
  const timeSlots = useMemo(() => {
    const slots = new Map<string, Map<string, JudgingSession>>();

    data.sessions
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
  }, [data.sessions, currentTime]);

  const rooms = data.rooms;

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
            </TableRow>
          </TableHead>
          <TableBody>
            {timeSlots.map(({ time, roomSessions }) => (
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
                            label={t('status.not-signed-in')}
                            size="small"
                            color="error"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                        {session.called ? (
                          <Chip
                            label={t('status.called')}
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        ) : (
                          <Chip
                            label={t('status.not-queued')}
                            size="small"
                            color="default"
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
