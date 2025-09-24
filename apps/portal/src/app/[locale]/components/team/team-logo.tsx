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
      {team.logoUrl ? (
        <Box
          component="img"
          src={team.logoUrl}
          alt={`Team ${teamNumber} Logo`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            p: 0.5
          }}
          onError={(e) => {
            // Hide logo and show fallback on error
            const target = e.currentTarget as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.team-fallback') as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }
          }}
        />
      ) : null}
      
      {/* Fallback Team Badge */}
      <Box
        className="team-fallback"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          borderRadius: 1,
          display: team.logoUrl ? 'none' : 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        <Box
          component="img"
          src="/assets/first.svg"
          alt="FIRST"
          sx={{
            width: 16,
            height: 16,
            mb: 0.3,
            filter: 'brightness(0) invert(1)'
          }}
        />
        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.6rem' }}>
          {teamNumber}
        </Typography>
      </Box>
    </Box>
  );
};
