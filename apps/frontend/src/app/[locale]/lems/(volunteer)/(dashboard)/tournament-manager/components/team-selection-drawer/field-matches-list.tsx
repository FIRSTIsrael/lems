'use client';

import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useMatchTranslations } from '@lems/localization';
import dayjs from 'dayjs';
import type { Match } from '../../graphql';
import type { MatchesListProps } from './types';

export function FieldMatchesList({
  slot,
  matches,
  isMobile
}: MatchesListProps & { matches: Match[] }) {
  const t = useTranslations('pages.tournament-manager');
  const { getStatus, getStage } = useMatchTranslations();

  const teamMatches = matches.filter(match =>
    match.participants.some(p => p.team?.id === slot?.team?.id)
  );

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {t('field-matches')}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : '1fr',
          gap: 1
        }}
      >
        {teamMatches.map(match => {
          const participant = match.participants.find(p => p.team?.id === slot?.team?.id);
          return (
            <Paper key={match.id} sx={{ p: 1, bgcolor: 'action.hover' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
                  {getStage?.(match.stage)} #{match.number} • {participant?.table.name} •{' '}
                  {dayjs(match.scheduledTime).format('HH:mm')}
                </Typography>
                <Chip
                  label={getStatus(match.status as 'not-started' | 'in-progress' | 'completed')}
                  size="small"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
