'use client';

import React, { useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Stack } from '@mui/material';
import { buildAwardsSlides, DeckRef, DeckView, GOTO_FINAL_STEP } from '@lems/presentations';
import { useAwardsPresentationContext } from '@lems/shared/providers';
import { useAwardTranslations } from '@lems/localization';
import { SlideDisplay } from './slide-display';
import { ControlsPanel } from './controls-panel';

interface AwardsPresentationDisplayProps {
  currentSlideLabel: string;
  nextSlideLabel: string;
}

export const AwardsPresentationDisplay: React.FC<AwardsPresentationDisplayProps> = ({
  currentSlideLabel,
  nextSlideLabel
}) => {
  const { awards, awardWinnerSlideStyle, presentationState } = useAwardsPresentationContext();
  const { getName, getDescription } = useAwardTranslations();
  const t = useTranslations('awards-presentation');
  const deckRef = useRef<DeckRef>(null) as React.RefObject<DeckRef>;
  const previewDeckRef = useRef<DeckRef>(null) as React.RefObject<DeckRef>;

  const awardSlides = useMemo(() => {
    const slides = buildAwardsSlides(awards, awardWinnerSlideStyle, {
      getAwardName: getName,
      getAwardDescription: getDescription,
      awardTranslation: (name: string) => t('prize', { name })
    });
    return slides;
  }, [awards, awardWinnerSlideStyle, getName, getDescription, t]);

  // Calculate total slides: title + awards grouped by index
  const totalSlides = useMemo(() => {
    if (!awards.length) return 0;
    const uniqueIndices = new Set(awards.map(a => a.index));
    return 1 + uniqueIndices.size; // title slide + one per award index
  }, [awards]);

  // Calculate next slide view (one step ahead)
  const endOfNextSlide = (view: DeckView): DeckView => ({
    slideIndex: view.slideIndex + 1,
    stepIndex: GOTO_FINAL_STEP
  });

  // Determine if we're on the final slide based on subscription state
  const isOnFinalSlide = totalSlides > 0 && totalSlides - 1 === presentationState.slideIndex;
  const showPreview = !isOnFinalSlide;

  return (
    <Stack spacing={3} height="100%">
      {/* Display Area - Current and Next Slide */}
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
        px={3}
        py={2}
        sx={{ flex: 1, minHeight: 0 }}
      >
        {/* Current Slide */}
        <SlideDisplay
          label={currentSlideLabel}
          deckRef={deckRef}
          initialState={presentationState}
          awardSlides={awardSlides}
        />

        {/* Preview Slide - Next Slide */}
        {showPreview && (
          <SlideDisplay
            label={nextSlideLabel}
            deckRef={previewDeckRef}
            initialState={endOfNextSlide(presentationState)}
            awardSlides={awardSlides}
          />
        )}
      </Stack>

      <ControlsPanel deckRef={deckRef} totalSlides={awardSlides.length + 1} />
    </Stack>
  );
};
