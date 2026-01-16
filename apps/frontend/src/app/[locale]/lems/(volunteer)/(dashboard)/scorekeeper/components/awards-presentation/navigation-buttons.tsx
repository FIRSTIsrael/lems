'use client';

import React, { useCallback } from 'react';
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
import { useMutation } from '@apollo/client/react';
import toast from 'react-hot-toast';
import { useEvent } from '../../../../components/event-context';
import { UPDATE_PRESENTATION_MUTATION } from '../../graphql';

interface NavigationButtonsProps {
  deckRef: React.RefObject<DeckRef>;
  totalSlides: number;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({ deckRef, totalSlides }) => {
  const t = useTranslations('pages.scorekeeper.awards-presentation');

  const { currentDivision } = useEvent();

  const [updatePresentation] = useMutation(UPDATE_PRESENTATION_MUTATION, {
    onError: () => {
      toast.error('Failed to update presentation state');
    }
  });

  const handlePresentationStateChange = useCallback(
    (slideIndex: number, stepIndex: number, slideId?: string) => {
      updatePresentation({
        variables: {
          divisionId: currentDivision.id,
          slideIndex,
          stepIndex,
          slideId
        }
      });
    },
    [updatePresentation, currentDivision.id]
  );

  const handleStepBackward = useCallback(() => {
    deckRef.current?.stepBackward();
    const currentState = deckRef.current?.activeView;
    if (currentState) {
      handlePresentationStateChange(currentState.slideIndex, currentState.stepIndex);
    }
  }, [deckRef, handlePresentationStateChange]);

  const handleStepForward = useCallback(() => {
    deckRef.current?.stepForward();
    const currentState = deckRef.current?.activeView;
    if (currentState) {
      handlePresentationStateChange(currentState.slideIndex, currentState.stepIndex);
    }
  }, [deckRef, handlePresentationStateChange]);

  const handleFirstSlide = useCallback(() => {
    deckRef.current?.skipTo({ slideIndex: 0, stepIndex: 0 });
    handlePresentationStateChange(0, 0);
  }, [deckRef, handlePresentationStateChange]);

  const handleLastSlide = useCallback(() => {
    deckRef.current?.skipTo({ slideIndex: totalSlides - 1, stepIndex: 0 });
    handlePresentationStateChange(totalSlides - 1, 0);
  }, [deckRef, totalSlides, handlePresentationStateChange]);

  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" justifyContent="center">
      <Button
        size="small"
        variant="outlined"
        onClick={handleFirstSlide}
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
        onClick={handleLastSlide}
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
