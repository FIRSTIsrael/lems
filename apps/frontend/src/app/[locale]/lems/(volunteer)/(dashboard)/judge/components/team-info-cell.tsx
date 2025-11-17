'use client';

import { Chip, Stack, Typography, Avatar, Box, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import type { Team } from '../judge.graphql';

interface TeamInfoCellProps {
  team: Team;
}

export const TeamInfoCell: React.FC<TeamInfoCellProps> = ({ team }) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Stack spacing={1} sx={{ minWidth: 200 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title={`Team #${team.number}`}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              fontSize: '0.95rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              color: 'white'
            }}
          >
            {getInitials(team.name) || team.number.charAt(0)}
          </Avatar>
        </Tooltip>
        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Team #{team.number}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {team.name}
          </Typography>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
          {team.affiliation}
        </Typography>
        {team.region && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            • {team.region}
          </Typography>
        )}
      </Box>

      <Chip
        icon={team.arrived ? <CheckCircleIcon /> : <WarningIcon />}
        label={team.arrived ? 'Arrived' : 'Not Arrived'}
        color={team.arrived ? 'success' : 'warning'}
        variant="outlined"
        size="small"
        sx={{ width: 'fit-content', fontWeight: 600 }}
      />

      {team.location && (
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Location: {team.location}
        </Typography>
      )}
    </Stack>
  );
};
