'use client';

import { Box, Typography } from '@mui/material';
import { useAudienceDisplay } from './audience-display-context';

export const MessageDisplay = () => {
  const { settings } = useAudienceDisplay();
  const message = (settings?.message?.value as string) || '';

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url(/assets/audience-display/audience-display-background.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 100%)',
          pointerEvents: 'none'
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '90%',
          textAlign: 'center',
          padding: '40px'
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem', lg: '5rem' },
            fontWeight: 800,
            color: '#000',
            textShadow: '0 2px 8px rgba(255, 255, 255, 0.5)',
            lineHeight: 1.2,
            wordWrap: 'break-word',
            animation: 'fadeInScale 0.8s ease-out'
          }}
        >
          {message}
        </Typography>
      </Box>

      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
  );
};
