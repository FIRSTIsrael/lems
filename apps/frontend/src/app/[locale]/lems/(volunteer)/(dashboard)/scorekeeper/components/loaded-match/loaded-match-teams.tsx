'use client';

import { useTranslations } from 'next-intl';
import { Stack, Box, Typography, Chip } from '@mui/material';
import { useScorekeeperData } from '../scorekeeper-context';
import { TeamStatusBadge } from './team-status-badge';
import { getTeamLabel } from './utils';

export function LoadedMatchTeams() {
  const t = useTranslations('pages.scorekeeper.next-match');
  const { loadedMatch: match } = useScorekeeperData();

  if (!match) return null;

  return (
    <Stack spacing={0.75} sx={{ flex: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: 0.5
        }}
      >
        {t('teams')}
      </Typography>

      <Stack spacing={0.5}>
        {match.participants.map((participant, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 0.75,
              bgcolor: 'action.hover',
              borderRadius: 0.75,
              border: '1.2px solid',
              borderColor: participant.ready ? 'success.main' : 'transparent',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'action.selected'
              }
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TeamStatusBadge participant={participant} />

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {getTeamLabel(participant)}
              </Typography>
            </Box>

            <Chip
              label={participant.table?.name || 'Unknown'}
              variant="filled"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                marginLeft: 1,
                flexShrink: 0
              }}
            />
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
