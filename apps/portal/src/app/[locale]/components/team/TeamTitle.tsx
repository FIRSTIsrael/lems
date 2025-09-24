'use client';

import React from 'react';
import { Typography, Stack } from '@mui/material';
import { Team } from './mockTeamData';
import { TeamLogo } from './TeamLogo';

interface TeamTitleProps {
  team: Team;
  teamNumber: number;
}

export const TeamTitle: React.FC<TeamTitleProps> = ({ team, teamNumber }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
      {/* Team Logo */}
      <TeamLogo team={team} teamNumber={teamNumber} />

      {/* Team Name */}
      <Typography variant="h4" component="h1" fontWeight="500">
        Team {teamNumber} - {team.name}
      </Typography>
    </Stack>
  );
};
