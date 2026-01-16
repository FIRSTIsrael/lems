'use client';

import React from 'react';
import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
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

  const handleStepBackward = () => {
    deckRef.current?.stepBackward();
  };

  const handleStepForward = () => {
    deckRef.current?.stepForward();
  };

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
        onClick={handleStepBackward}
        startIcon={<DirectionalIcon ltr={ChevronLeftIcon} rtl={ChevronRightIcon} />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('previous-step')}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={handleStepForward}
        startIcon={<DirectionalIcon ltr={ChevronRightIcon} rtl={ChevronLeftIcon} />}
        sx={{
          borderRadius: 1.5,
          textTransform: 'none',
          fontSize: '0.875rem'
        }}
      >
        {t('next-step')}
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
