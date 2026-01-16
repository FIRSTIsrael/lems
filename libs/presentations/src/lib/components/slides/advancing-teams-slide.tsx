'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Box, Typography, Paper } from '@mui/material';
import { Slide } from '../slide';
import { Stepper } from '../appear';
import { LogoStack } from '../logo-stack';

export interface AdvancingTeamsAward {
  id: string;
  name: string;
  divisionColor?: string;
  winner?: {
    id: string;
    name: string;
    number: number;
  };
}

interface AdvancingTeamsSlideProps {
  awards: AdvancingTeamsAward[];
}

export const AdvancingTeamsSlide: React.FC<AdvancingTeamsSlideProps> = ({ awards }) => {
  const t = useTranslations('awards-presentation');
  const teams = awards
    .filter(award => award.winner && 'number' in award.winner)
    .map(award => award.winner as { id: string; name: string; number: number });

  const divisionColor = awards[0]?.divisionColor;

  if (teams.length === 0) {
    return null;
  }

  return (
    <Slide>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={4}
        sx={{
          height: '100%',
          width: '100%',
          px: 20,
          textAlign: 'center',
          position: 'relative',
          pb: 15
        }}
      >
        <Typography
          variant="h2"
          sx={{ fontSize: '4rem', fontWeight: 'bold', color: 'white', mb: 2 }}
        >
          {t('advancing-teams')}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 4,
            maxWidth: '64rem'
          }}
        >
          <Stepper
            values={teams as unknown[]}
            render={(team: unknown) => {
              const teamData = team as { id: string; name: string; number: number };
              return (
                <Paper
                  key={teamData.id}
                  elevation={4}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: divisionColor || '#10b981',
                    transform: 'scale(1.05)',
                    transition: 'all 0.3s ease',
                    boxShadow: divisionColor ? `0 0 20px ${divisionColor}66` : undefined
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '2.25rem',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    #{teamData.number}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.5rem',
                      color: 'white',
                      mt: 1
                    }}
                  >
                    {teamData.name}
                  </Typography>
                </Paper>
              );
            }}
          />
        </Box>
        <LogoStack color={divisionColor} />
      </Stack>
    </Slide>
  );
};
