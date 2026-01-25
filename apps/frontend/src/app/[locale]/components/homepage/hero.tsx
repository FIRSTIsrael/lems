'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Stack, useTheme, alpha } from '@mui/material';
import { RichText } from '@lems/localization';

export const Hero: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations('homepage.hero');

  return (
    <Box
      position="relative"
      overflow="hidden"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: 'white',
        py: { xs: 10, md: 14 },
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.dark} 100%)`
      }}
    >
      {/* Decorative circles */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        sx={{
          width: { xs: 300, md: 500 },
          height: { xs: 300, md: 500 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.3)} 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        sx={{
          width: { xs: 250, md: 400 },
          height: { xs: 250, md: 400 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.3)} 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
      />

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
              border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              bgcolor: alpha(theme.palette.common.white, 0.15),
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 15px ${alpha(theme.palette.common.black, 0.1)}`
            }}
          >
            {t('badge')}
          </Box>

          {/* Main title - clean and bold */}
          <Typography
            variant="h1"
            fontWeight="800"
            sx={{
              fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}
          >
            {t('title')}
          </Typography>

          {/* Subtitle with emphasis */}
          <Typography
            variant="h5"
            fontWeight="400"
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              maxWidth: 700,
              opacity: 0.95,
              lineHeight: 1.5,
              textShadow: '0 2px 10px rgba(0,0,0,0.15)',
              '& i': {
                fontStyle: 'italic'
              }
            }}
          >
            <RichText>{tags => t.rich('subtitle', tags)}</RichText>
          </Typography>

          {/* Clean divider */}
          <Box
            sx={{
              width: { xs: 60, md: 80 },
              height: 3,
              background: `linear-gradient(90deg, ${alpha(theme.palette.common.white, 0.6)} 0%, ${alpha(theme.palette.secondary.light, 0.4)} 100%)`,
              borderRadius: 1,
              my: 1,
              boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.1)}`
            }}
          />

          {/* Description */}
          <Typography
            variant="body1"
            sx={{
              fontSize: '1.125rem',
              maxWidth: 600,
              opacity: 0.9,
              lineHeight: 1.7,
              textShadow: '0 1px 5px rgba(0,0,0,0.1)'
            }}
          >
            {t('description')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
