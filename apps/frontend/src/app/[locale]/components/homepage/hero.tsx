'use client';

import React from 'react';
import { Box, Container, Typography, Stack, useTheme } from '@mui/material';

export const Hero: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      position="relative"
      overflow="hidden"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: 'white',
        py: { xs: 10, md: 14 },
        background: `linear-gradient(180deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      }}
    >
      {/* Subtle grid lines for depth */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        sx={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.5
        }}
      />

      {/* Clean gradient fade at bottom */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="30%"
        sx={{
          background: `linear-gradient(to bottom, transparent, ${theme.palette.primary.dark})`
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack
          spacing={3}
          alignItems={{ xs: 'center', md: 'flex-start' }}
          textAlign={{ xs: 'center', md: 'left' }}
          sx={{ maxWidth: 900 }}
        >
          {/* Minimal badge */}
          <Box
            sx={{
              display: 'inline-flex',
              px: 2,
              py: 0.5,
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              bgcolor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            Event Management Platform
          </Box>

          {/* Main title - clean and bold */}
          <Typography
            variant="h1"
            fontWeight="800"
            sx={{
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.1
            }}
          >
            LEMS
          </Typography>

          {/* Subtitle with emphasis */}
          <Typography
            variant="h5"
            fontWeight="400"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              maxWidth: 700,
              opacity: 0.95,
              lineHeight: 1.5
            }}
          >
            Streamlined management for{' '}
            <Box component="span" fontWeight="600">
              FIRST LEGO League Challenge
            </Box>{' '}
            events
          </Typography>

          {/* Clean divider */}
          <Box
            sx={{
              width: { xs: 60, md: 80 },
              height: 3,
              bgcolor: 'rgba(255,255,255,0.4)',
              borderRadius: 1,
              my: 1
            }}
          />

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.125rem',
              maxWidth: 600,
              opacity: 0.85,
              lineHeight: 1.7
            }}
          >
            Access live events, explore upcoming competitions, and manage every aspect of your tournament with ease.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
