'use client';

import { useTranslations } from 'next-intl';
import { Typography, Stack, Box, Chip } from '@mui/material';
import { TablePairOutline } from '@lems/shared/components';
import { groupFilledParticipantsByPair } from '@lems/shared/utils';
import { useScorekeeperData } from '../scorekeeper-context';
import { getTeamLabel } from '../loaded-match/utils';

export const ActiveMatchTeams = () => {
  const t = useTranslations('pages.scorekeeper.active-match');

  const { activeMatch: match } = useScorekeeperData();
  if (!match) return null;

  const pairGroups = groupFilledParticipantsByPair(
    match.participants,
    match.participants.map(p => p.table)
  );

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
        {pairGroups.map(group => (
          <TablePairOutline key={group.key} sx={{ flexDirection: 'column', gap: 0.5 }}>
            {group.participants.map((participant, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 0.75,
                  bgcolor: 'action.hover',
                  borderRadius: 0.75,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
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
          </TablePairOutline>
        ))}
      </Stack>
    </Stack>
  );
};
