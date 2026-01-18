'use client';

import React from 'react';
import { Paper, Typography, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
import { DeckRef } from '@lems/presentations';
import { useAwardsPresentationContext } from '@lems/shared/providers';
import { NavigationButtons } from './navigation-buttons';

interface ControlsPanelProps {
  deckRef: React.RefObject<DeckRef>;
  totalSlides: number;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({ deckRef, totalSlides }) => {
  const t = useTranslations('pages.scorekeeper.awards-presentation');
  const theme = useTheme();
  const { presentationState } = useAwardsPresentationContext();

  return (
    <Paper
      sx={{
        p: 2.5,
        backgroundColor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        boxShadow: theme.shadows[1]
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          letterSpacing: 0.5
        }}
      >
        {t('slide-info')} {presentationState.slideIndex + 1} / {totalSlides}
      </Typography>

      <NavigationButtons deckRef={deckRef} totalSlides={totalSlides} />
    </Paper>
  );
};
