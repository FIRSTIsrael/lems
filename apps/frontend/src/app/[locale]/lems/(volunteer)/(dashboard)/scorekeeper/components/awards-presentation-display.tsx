'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Stack, Paper, Typography, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Home as HomeIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { Deck, DeckRef, DeckView, GOTO_FINAL_STEP } from '@lems/presentations';
import { DirectionalIcon } from '@lems/localization';
import { useAwardsPresentationContext } from '@lems/shared';
import { buildAwardsSlides } from '../../../audience-display/components/awards/slides-builder';
import { TitleSlide } from '../../../audience-display/components/awards/slides/title-slide';

export const AwardsPresentationDisplay: React.FC = () => {
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

  const handleStepBackward = () => {
    deckRef.current?.stepBackward();
  };

  const handleStepForward = () => {
    deckRef.current?.stepForward();
  };

  return (
    <Stack spacing={2} height="100%">
      {/* Display Area - Current and Next Slide */}
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" p={4}>
        {/* Current Slide */}
        <Stack spacing={2} flex={1} minWidth={0}>
          <Typography textAlign="center" variant="h6">
            שקף נוכחי
          </Typography>
          <Paper
            sx={{
              flex: 1,
              backgroundColor: '#000',
              borderRadius: 1,
              overflow: 'hidden',
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Deck
              ref={deckRef}
              initialState={presentationState}
              enableReinitialize={true}
              onViewUpdate={handleSlideUpdate}
            >
              <TitleSlide primary="טקס הפרסים" />
              {awardSlides}
            </Deck>
          </Paper>
        </Stack>

        {/* Preview Slide - Next Slide */}
        {showPreview && (
          <Stack spacing={2} flex={1} minWidth={0}>
            <Typography textAlign="center" variant="h6">
              שקף הבא
            </Typography>
            <Paper
              sx={{
                flex: 1,
                backgroundColor: '#000',
                borderRadius: 1,
                overflow: 'hidden',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Deck
                ref={previewDeckRef}
                initialState={endOfNextSlide(currentView)}
                enableReinitialize={true}
              >
                <TitleSlide primary="טקס הפרסים" />
                {awardSlides}
              </Deck>
            </Paper>
          </Stack>
        )}
      </Stack>

      {/* Controls */}
      <Paper
        sx={{
          p: 2,
          backgroundColor: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Slide/Step Info */}
        <Typography variant="body2" sx={{ color: '#999', fontFamily: 'monospace' }}>
          Slide: {presentationState.slideIndex + 1} / {totalSlides}
        </Typography>

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <IconButton
            size="small"
            title="Go to first slide"
            onClick={() => deckRef.current?.skipTo({ slideIndex: 0, stepIndex: 0 })}
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <HomeIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title="Previous slide"
            onClick={() => deckRef.current?.regressSlide()}
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <DirectionalIcon ltr={SkipPreviousIcon} rtl={SkipNextIcon} sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title="Next slide"
            onClick={() => deckRef.current?.advanceSlide()}
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <DirectionalIcon ltr={SkipNextIcon} rtl={SkipPreviousIcon} sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title="Go to last slide"
            onClick={() => deckRef.current?.skipTo({ slideIndex: totalSlides - 1, stepIndex: 0 })}
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <GetAppIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Stack>

        {/* Step Controls */}
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={handleStepBackward}
            title="Previous step"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <DirectionalIcon
              ltr={ChevronLeftIcon}
              rtl={ChevronRightIcon}
              sx={{ fontSize: '18px' }}
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleStepForward}
            title="Next step"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <DirectionalIcon
              ltr={ChevronRightIcon}
              rtl={ChevronLeftIcon}
              sx={{ fontSize: '18px' }}
            />
          </IconButton>
        </Stack>
      </Paper>
    </Stack>
  );
};
