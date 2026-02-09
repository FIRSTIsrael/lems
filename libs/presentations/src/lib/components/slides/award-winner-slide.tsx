'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Typography, Paper } from '@mui/material';
import { useAwardTranslations } from '@lems/localization';
import { Slide } from '../slide';
import { Appear } from '../appear';
import { LogoStack } from '../logo-stack';

export interface TeamWinner {
  id: string;
  name: string;
  number: string | number;
  city: string;
  affiliation: string;
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
  const { getName } = useAwardTranslations();
  const t = useTranslations('awards-presentation');

  if (!award.winner) {
    return null;
  }

  const isTeamWinner = 'number' in award.winner;
  const winner = award.winner as TeamWinner | PersonalWinner;
  const localizedAwardName = getName(award.name);

  console.log('Rendering AwardWinnerSlide for award:', award);

  return (
    <Slide chromaKey={chromaKey}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={3}
        sx={{
          height: '100%',
          width: '100%',
          px: 4,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Appear activeStyle={{ opacity: 1, y: 0 }} inactiveStyle={{ opacity: 0, y: 20 }}>
          <Stack direction="column" spacing={1}>
            <Typography variant="h2" sx={{ fontSize: '5rem', fontWeight: 700, color: 'black' }}>
              {localizedAwardName}
            </Typography>
            {award.place && (
              <Typography sx={{ fontSize: '3.5rem', color: 'grey.700', fontWeight: 600 }}>
                {t('place', { place: award.place })}
              </Typography>
            )}
          </Stack>
        </Appear>

        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            px: 10,
            py: 8,
            width: '90%',
            maxWidth: '900px',
            backgroundColor: 'white',
            boxShadow: award.divisionColor
              ? `0 20px 40px ${award.divisionColor}40, 0 0 60px ${award.divisionColor}20`
              : '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: award.divisionColor ? `3px solid ${award.divisionColor}` : 'none'
          }}
        >
          <Appear
            activeStyle={{ opacity: 1, scale: 1 }}
            inactiveStyle={{ opacity: 0, scale: 0.95 }}
          >
            <Stack direction="column" spacing={3}>
              <Typography
                sx={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                {isTeamWinner ? t('awarded-to-team') : t('awarded-to')}
              </Typography>
              {isTeamWinner ? (
                <>
                  <Stack direction="column" spacing={2}>
                    <Typography
                      sx={{
                        fontSize: '4.5rem',
                        fontWeight: 900,
                        color: award.divisionColor || 'primary.main',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      #{(winner as TeamWinner).number}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1.2
                      }}
                    >
                      {(winner as TeamWinner).name}
                    </Typography>
                  </Stack>
                  {(winner as TeamWinner).affiliation && (
                    <Typography
                      sx={{ fontSize: '1.75rem', color: 'text.secondary', fontWeight: 500 }}
                    >
                      {(winner as TeamWinner).affiliation}, {(winner as TeamWinner).city}
                    </Typography>
                  )}
                </>
              ) : (
                <>
                  <Typography
                    sx={{
                      fontSize: '4rem',
                      fontWeight: 900,
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {(winner as PersonalWinner).name}
                  </Typography>
                </>
              )}
            </Stack>
          </Appear>
        </Paper>

        {/* <LogoStack color={award.divisionColor} /> */}
      </Stack>
    </Slide>
  );
};
