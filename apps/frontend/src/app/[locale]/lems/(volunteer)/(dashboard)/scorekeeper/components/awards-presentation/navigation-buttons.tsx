'use client';

import React from 'react';
import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Home as HomeIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { DeckRef } from '@lems/presentations';

interface NavigationButtonsProps {
  deckRef: React.RefObject<DeckRef>;
  totalSlides: number;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ deckRef, totalSlides }) => {
  const t = useTranslations('pages.scorekeeper.awards-presentation');

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
      <Button
        size="small"
        variant="outlined"
        onClick={() => deckRef.current?.skipTo({ slideIndex: 0, stepIndex: 0 })}
        startIcon={<HomeIcon />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('first-slide')}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => deckRef.current?.regressSlide()}
        startIcon={<DirectionalIcon ltr={SkipPreviousIcon} rtl={SkipNextIcon} />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('previous-slide')}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => deckRef.current?.advanceSlide()}
        startIcon={<DirectionalIcon ltr={SkipNextIcon} rtl={SkipPreviousIcon} />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('next-slide')}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => deckRef.current?.skipTo({ slideIndex: totalSlides - 1, stepIndex: 0 })}
        startIcon={<GetAppIcon />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('last-slide')}
      </Button>
    </Stack>
  );
};
