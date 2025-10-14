'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useTeam } from './team-context';

export const TeamLogo: React.FC = () => {
  const team = useTeam();

  return (
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Box
        component="img"
        src={team.logoUrl ?? '/assets/default-avatar.svg'}
        alt={`Team ${team.number} Logo`}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          p: 0.5
        }}
      />
    </Box>
  );
};
