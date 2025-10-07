'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface WinnerBannerProps {
  year: string;
  competition: string;
}

export const WinnerBanner: React.FC<WinnerBannerProps> = ({ year, competition }) => {
  return (
    <Box
      sx={{
        backgroundImage: 'url(/assets/banner-bg.svg)',
        backgroundSize: '100% 100%', // Force to fill exactly
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        p: 0,
        borderRadius: 2,
        textAlign: 'center',
        minWidth: 260,
        width: 260,
        height: 260,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}
    >
      {/* FIRST Logo in banner */}
      <Box
        component="img"
        src="/assets/first.svg"
        alt="FIRST"
        sx={{
          width: 80,
          height: 80,
          mt: 1,
          mb: 0.5
        }}
      />

      {/* WINNER text */}
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          fontSize: '1.5rem',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
          mb: 2.5
        }}
      >
        WINNER
      </Typography>

      {/* Year */}
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{
          fontSize: '1rem',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          mb: 0.8
        }}
      >
        {year}
      </Typography>

      {/* Competition name */}
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.9rem',
          lineHeight: 1.2,
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          px: 2,
          maxWidth: '100%',
          wordBreak: 'break-word'
        }}
      >
        {competition}
      </Typography>
    </Box>
  );
};
