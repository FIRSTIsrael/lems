'use client';

import React from 'react';
import { Stack, Typography, Paper } from '@mui/material';
import { Slide } from '../slide';
import { LogoStack } from '../logo-stack';

interface TitleSlideProps {
  primary: string;
  secondary?: string | React.ReactNode;
  divisionColor?: string;
  awardId?: string;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({ primary, secondary, divisionColor }) => {
  return (
    <Slide>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        spacing={6}
        sx={{
          height: '100%',
          width: '100%',
          px: 4,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Paper
          elevation={8}
          sx={{
            borderRadius: 3,
            px: 12,
            py: 10,
            width: '90%',
            maxWidth: '1000px',
            backgroundColor: 'white',
            boxShadow: divisionColor
              ? `0 20px 40px ${divisionColor}40, 0 0 60px ${divisionColor}20`
              : '0 20px 40px rgba(0, 0, 0, 0.15)',
            border: divisionColor ? `3px solid ${divisionColor}` : 'none'
          }}
        >
          <Stack direction="column" spacing={4}>
            <Typography
              variant="h1"
              sx={{
                fontSize: '5.5rem',
                fontWeight: 900,
                color: 'black',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              {primary}
            </Typography>

            {secondary && (
              <Typography
                sx={{
                  fontSize: '2.5rem',
                  color: 'text.secondary',
                  fontWeight: 600,
                  lineHeight: 1.4
                }}
              >
                {secondary}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* <LogoStack color={divisionColor} /> */}
      </Stack>
    </Slide>
  );
};
