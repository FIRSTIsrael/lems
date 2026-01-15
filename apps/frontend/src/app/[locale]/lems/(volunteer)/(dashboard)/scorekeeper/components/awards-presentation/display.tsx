'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Stack } from '@mui/material';
import { DeckRef, DeckView, GOTO_FINAL_STEP } from '@lems/presentations';
import { useAwardsPresentationContext } from '@lems/shared';
import { buildAwardsSlides } from '../../../../audience-display/components/awards/slides-builder';
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
  const deckRef = useRef<DeckRef>(null);
  const previewDeckRef = useRef<DeckRef>(null);
  const [currentView, setCurrentView] = useState<DeckView>(presentationState);
  const [showPreview, setShowPreview] = useState(true);

  const awardSlides = useMemo(
    () => buildAwardsSlides(awards, awardWinnerSlideStyle),
    [awards, awardWinnerSlideStyle]
  );

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

  // Handle slide update - update preview and show/hide it appropriately
  const handleSlideUpdate = (newView: DeckView) => {
    setCurrentView(newView);
    const isOnFinalSlide = totalSlides - 1 === newView.slideIndex;
    setShowPreview(!isOnFinalSlide);

    if (previewDeckRef.current && !isOnFinalSlide) {
      previewDeckRef.current.skipTo(endOfNextSlide(newView));
    }
  };

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
          onViewUpdate={handleSlideUpdate}
          awardSlides={awardSlides}
        />

        {/* Preview Slide - Next Slide */}
        {showPreview && (
          <SlideDisplay
            label={nextSlideLabel}
            deckRef={previewDeckRef}
            initialState={endOfNextSlide(currentView)}
            awardSlides={awardSlides}
          />
        )}
      </Stack>

      {/* Controls */}
      <ControlsPanel
        deckRef={deckRef}
        currentSlideIndex={presentationState.slideIndex}
        totalSlides={totalSlides}
      />
    </Stack>
  );
};
