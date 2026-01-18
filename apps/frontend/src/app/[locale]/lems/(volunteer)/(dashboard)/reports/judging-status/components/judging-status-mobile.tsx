'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Card, CardContent, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { useJudgingStatus } from '../judging-status-context';
import { useTime } from '../../../../../../../../lib/time/hooks';
import { SessionCard } from './session-card';

export const JudgingStatusMobile: React.FC = () => {
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
            return session ? (
              <SessionCard
                key={`${room.id}-${session.id}`}
                session={session}
                room={room}
                isCurrentRound={true}
                sessionLength={sessionLength}
                currentTime={currentTime}
              />
            ) : null;
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
            return session ? (
              <SessionCard
                key={`${room.id}-${session.id}`}
                session={session}
                room={room}
                isCurrentRound={false}
                sessionLength={sessionLength}
                currentTime={currentTime}
              />
            ) : null;
          })}
        </Box>
      )}
    </Stack>
  );
};
