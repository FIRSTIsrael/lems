'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { Team } from './mockTeamData';
import { TeamTitle } from './team-title';
import { TeamInfo } from './team-info';

interface TeamHeaderProps {
  team: Team;
  teamNumber: number;
}

export const TeamHeader: React.FC<TeamHeaderProps> = ({ team, teamNumber }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      {/* Team Title Section */}
      <TeamTitle team={team} teamNumber={teamNumber} />

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Team Information */}
        <TeamInfo team={team} />

        {/* Robot Photo - Commented out for now */}
        {/* <Box sx={{ flex: 1, maxWidth: { md: '300px' } }}>
          Robot photo would go here
        </Box> */}
      </Box>
    </Paper>
  );
};
