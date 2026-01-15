'use client';

import React, { CSSProperties } from 'react';
import { Stack, Box } from '@mui/material';
import Image from 'next/image';

interface LogoStackProps {
  color?: CSSProperties['color'];
}

export const LogoStack: React.FC<LogoStackProps> = ({ color }) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-around"
      alignItems="center"
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '100px',
        bgcolor: '#f7f8f9',
        borderTop: `10px solid ${color || 'transparent'}`
      }}
    >
      <Box sx={{ position: 'relative', height: '100%', width: '200px', padding: 2 }}>
        <Image
          src="/assets/audience-display/sponsors/first-israel-horizontal.svg"
          alt="FIRST Israel"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box sx={{ position: 'relative', height: '100%', width: '200px', padding: 2 }}>
        <Image
          src="/assets/audience-display/sponsors/technion-horizontal.svg"
          alt="Technion"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box sx={{ position: 'relative', height: '100%', width: '200px', padding: 2 }}>
        <Image
          src="/assets/audience-display/sponsors/fllc-horizontal.svg"
          alt="FLLC"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
      <Box sx={{ position: 'relative', height: '100%', width: '200px', padding: 2 }}>
        <Image
          src="/assets/audience-display/season-logo.svg"
          alt="Season Logo"
          fill
          style={{ objectFit: 'contain' }}
        />
      </Box>
    </Stack>
  );
};
