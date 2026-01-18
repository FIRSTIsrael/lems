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
import {
  UPDATE_PRESENTATION_MUTATION,
  getUpdatePresentationOptimisticResponse
} from '../../graphql';

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
      const variables = {
        divisionId: currentDivision.id,
        slideIndex,
        stepIndex,
        slideId
      };

      // Use optimistic response for immediate UI feedback
      updatePresentation({
        variables,
        optimisticResponse: getUpdatePresentationOptimisticResponse(variables)
      });
    },
    [updatePresentation, currentDivision.id]
  );

  /**
   * Helper: Use Deck as a reference to compute correct next state
   * Read what stepForward WOULD do without mutating Deck
   */
  const computeNextStepState = useCallback((): { slideIndex: number; stepIndex: number } | null => {
    if (!deckRef.current?.activeView) return null;

    // Temporarily advance to see what the next state would be
    const currentSlideIndex = deckRef.current.activeView.slideIndex;
    const currentStepIndex = deckRef.current.activeView.stepIndex;

    // For now, simple heuristic: step forward
    // If we need smarter logic, we'd need to inspect Slide components
    return {
      slideIndex: currentSlideIndex,
      stepIndex: currentStepIndex + 1
    };
  }, [deckRef]);

  /**
   * Helper: Compute previous state safely
   */
  const computePreviousStepState = useCallback((): {
    slideIndex: number;
    stepIndex: number;
  } | null => {
    if (!deckRef.current?.activeView) return null;

    const currentSlideIndex = deckRef.current.activeView.slideIndex;
    const currentStepIndex = deckRef.current.activeView.stepIndex;

    return {
      slideIndex: currentSlideIndex,
      stepIndex: currentStepIndex - 1
    };
  }, [deckRef]);

  const handleStepBackward = useCallback(() => {
    const nextState = computePreviousStepState();
    if (nextState) {
      handlePresentationStateChange(nextState.slideIndex, nextState.stepIndex);
    }
  }, [computePreviousStepState, handlePresentationStateChange]);

  const handleStepForward = useCallback(() => {
    const nextState = computeNextStepState();
    if (nextState) {
      handlePresentationStateChange(nextState.slideIndex, nextState.stepIndex);
    }
  }, [computeNextStepState, handlePresentationStateChange]);

  const handleFirstSlide = useCallback(() => {
    handlePresentationStateChange(0, 0);
  }, [handlePresentationStateChange]);

  const handleLastSlide = useCallback(() => {
    handlePresentationStateChange(totalSlides - 1, 0);
  }, [totalSlides, handlePresentationStateChange]);

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
