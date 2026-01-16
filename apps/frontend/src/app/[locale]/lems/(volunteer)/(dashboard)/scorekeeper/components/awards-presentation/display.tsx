'use client';

import React, { useMemo, useRef, useState } from 'react';
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
  const [currentView, setCurrentView] = useState<DeckView>(presentationState);
  const [showPreview, setShowPreview] = useState(true);

  const awardSlides = useMemo(() => {
    console.log('[AwardsPresentationDisplay] Building slides with:', {
      awards,
      awardsCount: awards.length,
      awardWinnerSlideStyle,
      firstAward: awards[0]
    });
    const slides = buildAwardsSlides(awards, awardWinnerSlideStyle, {
      getAwardName: getName,
      getAwardDescription: getDescription,
      awardTranslation: (name: string) => t('prize', { name })
    });
    console.log('[AwardsPresentationDisplay] Built slides:', {
      slidesCount: slides.length,
      slides
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
