'use client';

import React from 'react';
import { Box, Paper } from '@mui/material';
import { TeamTitle } from './team-title';
import { TeamInfo } from './team-info';

export const TeamHeader: React.FC = () => {
  return (
    <Paper sx={{ p: 3, mb: 3 }} id="team-info">
      {/* Team Title Section */}
      <TeamTitle />

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Team Information */}
        <TeamInfo />
      </Box>
    </Paper>
  );
};
