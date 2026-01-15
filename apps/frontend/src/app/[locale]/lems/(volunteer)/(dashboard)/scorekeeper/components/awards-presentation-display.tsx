'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Stack, Paper, Typography, IconButton, useTheme } from '@mui/material';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('pages.scorekeeper.awards-presentation');
  const theme = useTheme();
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
        <Stack spacing={1.5} flex={1} minWidth={0}>
          <Typography
            textAlign="center"
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              fontSize: '0.875rem',
              letterSpacing: 0.5,
              textTransform: 'uppercase'
            }}
          >
            {t('current-slide')}
          </Typography>
          <Paper
            sx={{
              flex: 1,
              backgroundColor: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[2],
              transition: 'box-shadow 0.3s ease'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
              <Deck
                ref={deckRef}
                initialState={presentationState}
                enableReinitialize={true}
                onViewUpdate={handleSlideUpdate}
              >
                <TitleSlide primary="טקס הפרסים" />
                {awardSlides}
              </Deck>
            </div>
          </Paper>
        </Stack>

        {/* Preview Slide - Next Slide */}
        {showPreview && (
          <Stack spacing={1.5} flex={1} minWidth={0}>
            <Typography
              textAlign="center"
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                fontSize: '0.875rem',
                letterSpacing: 0.5,
                textTransform: 'uppercase'
              }}
            >
              {t('next-slide')}
            </Typography>
            <Paper
              sx={{
                flex: 1,
                backgroundColor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[2],
                transition: 'box-shadow 0.3s ease'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <Deck
                  ref={previewDeckRef}
                  initialState={endOfNextSlide(currentView)}
                  enableReinitialize={true}
                >
                  <TitleSlide primary="טקס הפרסים" />
                  {awardSlides}
                </Deck>
              </div>
            </Paper>
          </Stack>
        )}
      </Stack>

      {/* Controls */}
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
        {/* Slide/Step Info */}
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

        {/* Navigation Buttons */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap">
          <IconButton
            size="small"
            title={t('first-slide')}
            onClick={() => deckRef.current?.skipTo({ slideIndex: 0, stepIndex: 0 })}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            <HomeIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title={t('previous-slide')}
            onClick={() => deckRef.current?.regressSlide()}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            <DirectionalIcon ltr={SkipPreviousIcon} rtl={SkipNextIcon} sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title={t('next-slide')}
            onClick={() => deckRef.current?.advanceSlide()}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            <DirectionalIcon ltr={SkipNextIcon} rtl={SkipPreviousIcon} sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            title={t('last-slide')}
            onClick={() => deckRef.current?.skipTo({ slideIndex: totalSlides - 1, stepIndex: 0 })}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
          >
            <GetAppIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Stack>

        {/* Step Controls */}
        <Stack direction="row" spacing={1.5}>
          <IconButton
            size="small"
            onClick={handleStepBackward}
            title={t('previous-step')}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
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
            title={t('next-step')}
            sx={{
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1.5,
              padding: '8px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: theme.palette.primary.lighter || 'rgba(0, 61, 106, 0.08)',
                borderColor: 'primary.main'
              }
            }}
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
