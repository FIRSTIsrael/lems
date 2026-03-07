'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Typography, Box, Stack } from '@mui/material';
import { useAwardTranslations } from '@lems/localization';
import { Appear } from '../appear';
import { Slide } from '../slide';

export interface TeamWinner {
  id: string;
  name: string;
  number: string | number;
  city: string;
  affiliation: string;
  logoUrl?: string;
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

export interface AwardWinnerChromaSlideAward {
  id: string;
  name: string;
  place?: number;
  winner?: TeamWinner | PersonalWinner;
  divisionColor?: string;
}

interface AwardWinnerChromaSlideProps {
  award: AwardWinnerChromaSlideAward;
}

const AwardWinnerChromaSlide: React.FC<AwardWinnerChromaSlideProps> = ({ award }) => {
  const { getName } = useAwardTranslations();
  const t = useTranslations('awards-presentation');

  if (!award.winner) {
    return null;
  }

  const isTeamWinner = 'number' in award.winner;
  const winner = award.winner as TeamWinner | PersonalWinner;
  const localizedAwardName = getName(award.name);

  return (
    <Slide chromaKey>
      <Box
        sx={{
          background: '#f7f8f9',
          width: '85%',
          px: 6,
          py: 2,
          borderRadius: 4,
          textAlign: 'center',
          position: 'absolute',
          bottom: 60,
          borderWidth: '0 0 10px 10px',
          borderStyle: 'solid',
          borderColor: award.divisionColor ? award.divisionColor : undefined
        }}
      >
        <Typography variant="h2" sx={{ fontSize: '2.5rem', fontWeight: 700, color: 'black' }}>
          {localizedAwardName} {award.place && `| ${t('place', { place: award.place })}`}
        </Typography>
        <Appear activeStyle={{ opacity: 1, scale: 1 }} inactiveStyle={{ opacity: 0, scale: 0.95 }}>
          <Stack direction="column" spacing={1}>
            {isTeamWinner ? (
              <>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 120,
                      height: 120,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Image
                      src={
                        (winner as TeamWinner).logoUrl
                          ? ((winner as TeamWinner).logoUrl as string)
                          : '/assets/default-avatar.svg'
                      }
                      alt={(winner as TeamWinner).name}
                      fill
                      style={{ objectFit: 'contain', padding: 8 }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '3.5rem',
                      fontWeight: 800,
                      color: award.divisionColor || 'primary.main',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {(winner as TeamWinner).name} #{(winner as TeamWinner).number}
                  </Typography>
                </Stack>
                {(winner as TeamWinner).affiliation && (
                  <Typography
                    sx={{ fontSize: '1.75rem', color: 'text.secondary', fontWeight: 600 }}
                  >
                    {(winner as TeamWinner).affiliation}, {(winner as TeamWinner).city}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: '5rem',
                    fontWeight: 800,
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
        <Image
          src="/assets/audience-display/sponsors/first-horizontal.svg"
          alt="תמונת ספונסר"
          width={250}
          height={100}
          style={{ position: 'fixed', left: 1920 - 250 - 180, bottom: 80 }}
        />
        <Image
          src="/assets/audience-display/season-logo.svg"
          alt="תמונת ספונסר"
          width={250}
          height={100}
          style={{ position: 'fixed', left: 180, bottom: 80 }}
        />
      </Box>
    </Slide>
  );
};

export default AwardWinnerChromaSlide;
