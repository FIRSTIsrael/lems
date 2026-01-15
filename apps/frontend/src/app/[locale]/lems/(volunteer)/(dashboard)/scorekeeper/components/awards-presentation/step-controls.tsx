'use client';

import React from 'react';
import { Stack, Button } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { DeckRef } from '@lems/presentations';

interface StepControlsProps {
  deckRef: React.RefObject<DeckRef>;
}

export const StepControls: React.FC<StepControlsProps> = ({ deckRef }) => {
  const t = useTranslations('pages.scorekeeper.awards-presentation');

  const handleStepBackward = () => {
    deckRef.current?.stepBackward();
  };

  const handleStepForward = () => {
    deckRef.current?.stepForward();
  };

  return (
    <Stack direction="row" spacing={1.5} justifyContent="center">
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
    </Stack>
  );
};
