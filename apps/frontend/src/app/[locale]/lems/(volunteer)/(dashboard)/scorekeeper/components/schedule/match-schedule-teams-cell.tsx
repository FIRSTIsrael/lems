'use client';

import { Typography, Box, Tooltip } from '@mui/material';
import { TablePairOutline } from '@lems/shared/components';
import { groupFilledParticipantsByPair } from '@lems/shared/utils';
import { Match } from '../../graphql';

interface TeamsCellProps {
  participants: Match['participants'];
}

export const TeamsCell = ({ participants }: TeamsCellProps) => {
  const pairGroups = groupFilledParticipantsByPair(
    participants,
    participants.map(p => p.table)
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      {pairGroups.map(group => (
        <TablePairOutline key={group.key} sx={{ gap: 2, alignItems: 'center' }}>
          {group.participants.map((participant, idx) => {
            const { team, table } = participant;
            const teamNumber = team?.number ? `#${team.number}` : '—';

            return (
              <Box key={idx} sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {table?.name || 'Unknown'}
                </Typography>
                <Tooltip
                  title={team ? `${team.name} • ${team.affiliation}, ${team.city}` : ''}
                  arrow
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      minWidth: '2.5rem',
                      fontFamily: 'monospace'
                    }}
                  >
                    {teamNumber}
                  </Typography>
                </Tooltip>
              </Box>
            );
          })}
        </TablePairOutline>
      ))}
    </Box>
  );
};
