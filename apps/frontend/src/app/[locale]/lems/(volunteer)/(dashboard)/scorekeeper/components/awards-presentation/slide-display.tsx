'use client';

import React from 'react';
import { Stack, Paper, Typography, useTheme } from '@mui/material';
import { Deck, DeckRef, DeckView, TitleSlide } from '@lems/presentations';

interface SlideDisplayProps {
  label: string;
  deckRef: React.RefObject<DeckRef>;
  initialState: DeckView;
  onViewUpdate?: (view: DeckView) => void;
  awardSlides: React.ReactNode[];
}

export const SlideDisplay: React.FC<SlideDisplayProps> = ({
  label,
  deckRef,
  initialState,
  onViewUpdate,
  awardSlides
}) => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5} flex={1} minWidth={0}>
      <Typography
        textAlign="center"
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          fontSize: '0.875rem',
          letterSpacing: 0.5,
          textTransform: 'uppercase'
        }}
      >
        {label}
      </Typography>
      <Paper
        sx={{
          flex: 1,
          backgroundColor: '#000',
          borderRadius: 2,
          overflow: 'hidden',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
          transition: 'box-shadow 0.3s ease'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <Deck
            ref={deckRef}
            initialState={initialState}
            enableReinitialize={true}
            onViewUpdate={onViewUpdate}
          >
            <TitleSlide primary="טקס הפרסים" />
            {awardSlides}
          </Deck>
        </div>
      </Paper>
    </Stack>
  );
};
