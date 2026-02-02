'use client';

import dayjs from 'dayjs';
import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import type { JudgingSession } from '../../graphql';
import type { SessionsListProps } from './types';

export function JudgingSessionsList({
  slot,
  sessions,
  isMobile
}: SessionsListProps & { sessions: JudgingSession[] }) {
  const t = useTranslations('pages.tournament-manager');
  const { getStatus } = useMatchTranslations();

  const teamSessions = sessions.filter(session => session.team?.id === slot?.team?.id);

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {t('judging-sessions')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
          gap: 1
        }}
      >
        {teamSessions.map(session => (
          <Paper key={session.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
                {t('session')} #{session.number} • {session.room.name} •{' '}
                {dayjs(session.scheduledTime).format('HH:mm')}
              </Typography>
              <Chip
                label={getStatus(session.status as 'not-started' | 'in-progress' | 'completed')}
                size="small"
                sx={{ fontSize: '0.65rem', height: 20 }}
              />
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
