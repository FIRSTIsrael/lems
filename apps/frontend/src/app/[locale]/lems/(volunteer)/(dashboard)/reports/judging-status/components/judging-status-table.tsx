'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import {
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
import { useJudgingStatus } from '../judging-status-context';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { SessionRow } from './session-row';
import { NextSessionRow } from './next-session-row';

export const JudgingStatusTable: React.FC = () => {
  const t = useTranslations('pages.judging-status');
  const {
    sessions: currentSessions,
    nextSessions,
    rooms,
    sessionLength,
    loading
  } = useJudgingStatus();
  const currentTime = useTime({ interval: 1000 });

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
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ fontWeight: 600, minWidth: 120, color: 'white' }}>
              {t('table.time')}
            </TableCell>
            {sortedRooms.map(room => (
              <TableCell
                key={room.id}
                align="center"
                sx={{ fontWeight: 600, minWidth: 200, color: 'white' }}
              >
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
                return (
                  <SessionRow
                    key={room.id}
                    session={session!}
                    currentTime={currentTime}
                    sessionLength={sessionLength}
                  />
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
                return <NextSessionRow key={room.id} session={session} />;
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
