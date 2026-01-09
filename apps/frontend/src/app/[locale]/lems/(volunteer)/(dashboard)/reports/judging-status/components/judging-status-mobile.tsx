'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs, { Dayjs } from 'dayjs';
import { Box, Card, CardContent, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { JudgingSession, Room } from '../graphql';
import { TeamInfo } from '../../../components/team-info';
import { SessionStatusChip } from './session-status-chip';

interface JudgingStatusMobileProps {
  currentSessions: JudgingSession[];
  nextSessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
  loading: boolean;
  currentTime: Dayjs;
}

export const JudgingStatusMobile: React.FC<JudgingStatusMobileProps> = ({
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
      <Stack spacing={2}>
        {[1, 2].map(section => (
          <Card key={section}>
            <CardContent>
              <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
              {sortedRooms.map(room => (
                <Box key={room.id} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={80} />
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  if (currentSessions.length === 0 && nextSessions.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          {t('empty-state.message')}
        </Typography>
      </Paper>
    );
  }

  const renderSessionCard = (session: JudgingSession, room: Room, isCurrentRound: boolean) => {
    const team = session.team;

    return (
      <Card
        key={`${room.id}-${session.id}`}
        sx={{
          mb: 2,
          bgcolor: isCurrentRound ? 'primary.50' : 'background.paper'
        }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t('table.room', { name: room.name })}
            </Typography>

            {team ? (
              <>
                <TeamInfo team={team} size="sm" />

                <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap">
                  <SessionStatusChip status={session.status} arrived={team.arrived} />
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
              </>
            ) : (
              <Typography variant="body2" color="text.disabled">
                {t('empty-state.no-team')}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Stack spacing={3}>
      {currentSessions.length > 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.100' }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('table.current-round')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTime
                  .hour(dayjs(currentSessions[0].scheduledTime).hour())
                  .minute(dayjs(currentSessions[0].scheduledTime).minute())
                  .format('HH:mm')}
              </Typography>
            </Stack>
          </Paper>

          {sortedRooms.map(room => {
            const session = currentSessions.find(s => s.room.id === room.id);
            return session ? renderSessionCard(session, room, true) : null;
          })}
        </Box>
      )}

      {nextSessions.length > 0 && (
        <Box>
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('table.next-round')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentTime
                  .hour(dayjs(nextSessions[0].scheduledTime).hour())
                  .minute(dayjs(nextSessions[0].scheduledTime).minute())
                  .format('HH:mm')}
              </Typography>
            </Stack>
          </Paper>

          {sortedRooms.map(room => {
            const session = nextSessions.find(s => s.room.id === room.id);
            return session ? renderSessionCard(session, room, false) : null;
          })}
        </Box>
      )}
    </Stack>
  );
};
