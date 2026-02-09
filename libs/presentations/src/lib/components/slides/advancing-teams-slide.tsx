'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Box, Typography, Paper } from '@mui/material';
import { Slide } from '../slide';
import { Stepper, Appear } from '../appear';

export interface AdvancingTeamsAward {
  id: string;
  name: string;
  divisionColor?: string;
  winner?: {
    id: string;
    name: string;
    number: string | number;
  };
}

interface AdvancingTeamsSlideProps {
  awards: AdvancingTeamsAward[];
}

export const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ awards }) => {
  const t = useTranslations('awards-presentation');
  const teams = awards
    .filter(award => award.winner && award.winner.id && award.winner.name && award.winner.number)
    .map(award => award.winner as { id: string; name: string; number: string | number });

  if (teams.length === 0) {
    return null;
  }

  return (
    <Slide>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={5}
        sx={{
          height: '100%',
          width: '100%',
          px: 4,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Appear activeStyle={{ opacity: 1, y: 0 }} inactiveStyle={{ opacity: 0, y: 20 }}>
          <Typography variant="h2" sx={{ fontSize: '5rem', fontWeight: 700, color: 'black' }}>
            {t('advancing-teams')}
          </Typography>
        </Appear>

        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            px: 6,
            py: 8,
            width: '100%',
            maxWidth: '1200px',
            backgroundColor: 'white',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          <Appear
            activeStyle={{ opacity: 1, scale: 1 }}
            inactiveStyle={{ opacity: 0, scale: 0.95 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: teams.length > 2 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                  lg:
                    teams.length > 3
                      ? 'repeat(4, 1fr)'
                      : `repeat(${Math.min(teams.length, 3)}, 1fr)`
                },
                gap: 4
              }}
            >
              <Stepper
                values={teams as unknown[]}
                render={(team: unknown) => {
                  const teamData = team as {
                    id: string;
                    name: string;
                    number: string | number;
                  };
                  return (
                    <Stack
                      key={teamData.id}
                      direction="column"
                      alignItems="center"
                      spacing={2}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        backgroundColor: '#f9fafb',
                        border: '2px solid #e5e7eb',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                          borderColor: '#d1d5db',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '3rem',
                          fontWeight: 900,
                          color: 'black',
                          letterSpacing: '-0.02em'
                        }}
                      >
                        #{teamData.number}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: 'text.primary',
                          textAlign: 'center',
                          lineHeight: 1.4
                        }}
                      >
                        {teamData.name}
                      </Typography>
                    </Stack>
                  );
                }}
              />
            </Box>
          </Appear>
        </Paper>
      </Stack>
    </Slide>
  );
};
