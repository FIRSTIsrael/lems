'use client';

import React, { useMemo } from 'react';
import { Stack, Paper, Typography, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Home as HomeIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { Deck } from '@lems/presentations';
import { useAwardsPresentationContext } from '@lems/shared';
import { buildAwardsSlides } from '../../../audience-display/components/awards/slides-builder';
import { TitleSlide } from '../../../audience-display/components/awards/slides/title-slide';

export const AwardsPresentationDisplay: React.FC = () => {
  const { awards, awardWinnerSlideStyle, presentationState } = useAwardsPresentationContext();

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

  const handleStepBackward = () => {
    // Handled by Deck component through onViewUpdate
  };

  const handleStepForward = () => {
    // Handled by Deck component through onViewUpdate
  };

  return (
    <Stack spacing={2} height="100%">
      {/* Display Area */}
      <Paper
        sx={{
          flex: 1,
          backgroundColor: '#000',
          borderRadius: 1,
          overflow: 'hidden',
          minHeight: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Deck initialState={presentationState} enableReinitialize={true}>
          <TitleSlide primary="טקס הפרסים" />
          {awardSlides}
        </Deck>
      </Paper>

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
            variant="contained"
            title="Go to first slide"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <HomeIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            variant="outlined"
            title="Previous slide"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <SkipPreviousIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            variant="outlined"
            title="Next slide"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <SkipNextIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            variant="contained"
            title="Go to last slide"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <GetAppIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Stack>

        {/* Step Controls */}
        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            variant="outlined"
            onClick={handleStepBackward}
            title="Previous step"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <ChevronLeftIcon sx={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton
            size="small"
            variant="outlined"
            onClick={handleStepForward}
            title="Next step"
            sx={{ color: '#fff', border: '1px solid #444' }}
          >
            <ChevronRightIcon sx={{ fontSize: '18px' }} />
          </IconButton>
        </Stack>
      </Paper>
    </Stack>
  );
};
