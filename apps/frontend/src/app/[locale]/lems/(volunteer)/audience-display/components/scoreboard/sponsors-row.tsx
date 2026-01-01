'use client';

import { Box, Paper, alpha } from '@mui/material';
import Image from 'next/image';
import sponsorImages from '../../../../../../../../public/assets/audience-display/sponsors';

export const SponsorsRow = () => {
  const sponsorsList = Object.values(sponsorImages);

  if (sponsorsList.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Paper
        sx={{
          p: 2,
          bgcolor: theme => alpha(theme.palette.background.paper, 0.95),
          borderRadius: 1.5
        }}
      >
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: 1
          }}
        >
          <Box
            sx={{
              display: 'flex',
              height: '80px',
              animation: 'scroll-left 40s linear infinite',
              willChange: 'transform'
            }}
          >
            {/* First set of sponsors */}
            {sponsorsList.map((sponsor, index) => (
              <Box
                key={`sponsor-1-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '180px',
                  px: 2,
                  flexShrink: 0
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Image
                    src={sponsor}
                    alt="Sponsor"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Box>
            ))}

            {sponsorsList.map((sponsor, index) => (
              <Box
                key={`sponsor-2-${index}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '180px',
                  px: 2,
                  flexShrink: 0
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Image
                    src={sponsor}
                    alt="Sponsor"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain'
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      <style>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </Box>
  );
};
