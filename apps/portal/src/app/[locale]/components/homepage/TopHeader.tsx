'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Chip, Stack, alpha, useTheme } from '@mui/material';

export default function TopHeader() {
  const theme = useTheme();
  const tHero = useTranslations('pages.index.hero');

  console.log('Theme colors:', {
    main: theme.palette.primary.main,
    dark: theme.palette.primary.dark,
    direction: theme.direction
  });

  return (
    <Box
      sx={{
        // Force gradient
        background: `${theme.palette.primary.main} !important`,
        backgroundImage:
          theme.direction === 'rtl'
            ? `linear-gradient(225deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%) !important`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%) !important`,
        color: 'white',
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        // Additional force gradient
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            theme.direction === 'rtl'
              ? `linear-gradient(225deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          zIndex: -1
        }
      }}
    >
      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack
          spacing={3}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          textAlign={{ xs: 'center', sm: 'left' }}
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {tHero('title')}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              opacity: 0.9,
              maxWidth: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            {tHero('subtitle')}
          </Typography>
          <Chip
            label={tHero('current-season', { season: 'SUBMERGED 2024-2025' })}
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              px: 2,
              py: 1
            }}
          />
        </Stack>
      </Container>
    </Box>
  );
}
