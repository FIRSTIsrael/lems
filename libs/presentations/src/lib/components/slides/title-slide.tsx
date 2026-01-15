import React from 'react';
import { Stack, Typography, Box } from '@mui/material';
import { Slide } from '../slide';
import { Appear } from '../appear';
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
        <Appear activeStyle={{ opacity: 1, scale: 1 }} inactiveStyle={{ opacity: 0, scale: 0.8 }}>
          <Typography variant="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', color: 'white' }}>
            {primary}
          </Typography>
        </Appear>
        {secondary && (
          <Appear activeStyle={{ opacity: 1, scale: 1 }} inactiveStyle={{ opacity: 0, scale: 0.8 }}>
            <Typography sx={{ fontSize: '3rem', color: 'grey.300' }}>{secondary}</Typography>
          </Appear>
        )}
        <LogoStack color={divisionColor} />
      </Stack>
    </Slide>
  );
};
