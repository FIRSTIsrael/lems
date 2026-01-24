'use client';

import { Box } from '@mui/material';

const backgroundAnimation = `
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes logoFloat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
    }
  }
`;

export const LogoDisplay = () => {
  return (
    <>
      <style>{backgroundAnimation}</style>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(-45deg, #003d6a 0%, #1a5f9a 25%, #0a2d5c 50%, #1a5f9a 75%, #003d6a 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'pulseGlow 4s ease-in-out infinite',
            pointerEvents: 'none'
          }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            component="img"
            src="/assets/audience-display/first-vertical.svg"
            alt="FIRST Logo"
            sx={{
              maxWidth: '500px',
              width: '90%',
              height: 'auto',
              filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))',
              animation: 'logoFloat 4s ease-in-out infinite',
              willChange: 'transform'
            }}
          />
        </Box>
      </Box>
    </>
  );
};
