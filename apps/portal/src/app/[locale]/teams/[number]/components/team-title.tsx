'use client';

import React from 'react';
import { Typography, Stack } from '@mui/material';
import { TeamLogo } from './team-logo';
import { useTeam } from './team-context';

export const TeamTitle: React.FC = () => {
  const team = useTeam();
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
      {/* Team Logo */}
      <TeamLogo />

      {/* Team Name */}
      <Typography variant="h4" component="h1" fontWeight="500">
        Team #{team.number} - {team.name}
      </Typography>
    </Stack>
  );
};
