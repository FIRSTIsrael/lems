import React from 'react';
import { Stack, Box, Typography } from '@mui/material';
import { Slide } from '../slide';
import { Appear } from '../appear';
import { LogoStack } from '../logo-stack';

export interface TeamWinner {
  id: string;
  name: string;
  number: number;
  affiliation?: {
    name: string;
    city: string;
  };
}

export interface PersonalWinner {
  id: string;
  name: string;
  team?: {
    id: string;
    name: string;
    number: number;
  };
}

export interface AwardWinnerSlideAward {
  id: string;
  name: string;
  place?: number;
  winner?: TeamWinner | PersonalWinner;
  divisionColor?: string;
}

interface AwardWinnerSlideProps {
  award: AwardWinnerSlideAward;
  chromaKey?: boolean;
}

export const AwardWinnerSlide: React.FC<AwardWinnerSlideProps> = ({ award, chromaKey = false }) => {
  if (!award.winner) {
    return null;
  }

  const isTeamWinner = 'number' in award.winner;
  const winner = award.winner as TeamWinner | PersonalWinner;

  return (
    <Slide chromaKey={chromaKey}>
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
          pb: 15,
          background: !chromaKey ? 'linear-gradient(to bottom, #1f2937, #111827)' : undefined
        }}
      >
        <Stack direction="column" alignItems="center" spacing={3} sx={{ mt: 2 }}>
          <Appear activeStyle={{ opacity: 1, y: 0 }} inactiveStyle={{ opacity: 0, y: 20 }}>
            <Stack direction="column" spacing={1}>
              <Typography
                variant="h2"
                sx={{ fontSize: '4rem', fontWeight: 600, color: 'grey.300' }}
              >
                פרס {award.name}
              </Typography>
              {award.place && award.place > 0 && (
                <Typography sx={{ fontSize: '2.5rem', color: 'grey.400' }}>
                  מקום {award.place}
                </Typography>
              )}
            </Stack>
          </Appear>

          <Box
            sx={{
              borderRadius: 2,
              px: 6,
              py: 4,
              maxWidth: '32rem',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: award.divisionColor
                ? `-10px 10px 12px ${award.divisionColor}74`
                : undefined
            }}
          >
            <Appear
              activeStyle={{ opacity: 1, scale: 1 }}
              inactiveStyle={{ opacity: 0, scale: 0.9 }}
            >
              <Stack direction="column" spacing={1}>
                <Typography
                  sx={{
                    fontSize: '1.875rem',
                    fontWeight: 600,
                    color: 'white',
                    mb: 1
                  }}
                >
                  {isTeamWinner ? 'מוענק לקבוצה' : 'מוענק ל'}
                </Typography>
                {isTeamWinner && 'number' in winner ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: '2.25rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      #{(winner as TeamWinner).number} {winner.name}
                    </Typography>
                    {(winner as TeamWinner).affiliation && (
                      <Typography sx={{ fontSize: '1.25rem', color: 'grey.300' }}>
                        {(winner as TeamWinner).affiliation?.name},{' '}
                        {(winner as TeamWinner).affiliation?.city}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontSize: '2.25rem',
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {winner.name}
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', color: 'grey.300' }}>
                      {(winner as PersonalWinner).team?.name} (#
                      {(winner as PersonalWinner).team?.number})
                    </Typography>
                  </>
                )}
              </Stack>
            </Appear>
          </Box>
        </Stack>

        <LogoStack color={award.divisionColor} />
      </Stack>
    </Slide>
  );
};
