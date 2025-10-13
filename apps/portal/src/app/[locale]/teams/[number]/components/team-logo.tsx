'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Team } from './mockTeamData';

interface TeamLogoProps {
  team: Team;
  teamNumber: number;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ team, teamNumber }) => {
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
        border: '2px solid #e0e0e0',
        bgcolor: 'white',
        position: 'relative'
      }}
    >
      <Box
        component="img"
        src={team.logoUrl ?? '/assets/default-avatar.svg'}
        alt={`Team ${teamNumber} Logo`}
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
