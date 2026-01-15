'use client';

import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Slide } from '../slide';
import { LogoStack } from '../logo-stack';

interface TitleSlideProps {
  primary: string;
  secondary?: string;
  divisionColor?: string;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary, divisionColor }) => {
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
          position: 'relative'
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'white' }}>
          {primary}
        </Typography>

        {secondary && (
          <Typography sx={{ fontSize: '3rem', color: 'grey.300' }}>{secondary}</Typography>
        )}
        <LogoStack color={divisionColor} />
      </Stack>
    </Slide>
  );
};
