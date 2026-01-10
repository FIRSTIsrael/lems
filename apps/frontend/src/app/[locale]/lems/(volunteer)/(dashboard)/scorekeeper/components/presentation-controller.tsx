import React, { useState, useEffect } from 'react';
import { DeckRef } from '@lems/presentations';
import { Button } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Home as HomeIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';

interface PresentationControllerProps {
  deckRef: React.RefObject<DeckRef | null>;
  onPresentationStateChange: (slideIndex: number, stepIndex: number) => void;
  totalSlides?: number;
}

export const PresentationController: React.FC<PresentationControllerProps> = ({
  deckRef,
  onPresentationStateChange,
  totalSlides = 0
}) => {
  const [slideInfo, setSlideInfo] = useState({ slideIndex: 0, stepIndex: 0 });

  useEffect(() => {
    // Update slide info whenever ref changes or totalSlides changes
    if (deckRef.current?.activeView) {
      setSlideInfo({
        slideIndex: deckRef.current.activeView.slideIndex,
        stepIndex: deckRef.current.activeView.stepIndex
      });
    }
  }, [deckRef, totalSlides]);

  const getCurrentState = () => ({
    slideCount: totalSlides,
    slideIndex: slideInfo.slideIndex,
    stepIndex: slideInfo.stepIndex
  });

  const current = getCurrentState();

  const updateSlideInfo = () => {
    if (deckRef.current?.activeView) {
      setSlideInfo({
        slideIndex: deckRef.current.activeView.slideIndex,
        stepIndex: deckRef.current.activeView.stepIndex
      });
    }
  };

  const handlePreviousSlide = () => {
    deckRef.current?.regressSlide();
    setTimeout(() => {
      updateSlideInfo();
      if (deckRef.current?.activeView) {
        onPresentationStateChange(
          deckRef.current.activeView.slideIndex,
          deckRef.current.activeView.stepIndex
        );
      }
    }, 0);
  };

  const handleNextSlide = () => {
    deckRef.current?.advanceSlide();
    setTimeout(() => {
      updateSlideInfo();
      if (deckRef.current?.activeView) {
        onPresentationStateChange(
          deckRef.current.activeView.slideIndex,
          deckRef.current.activeView.stepIndex
        );
      }
    }, 0);
  };

  const handlePreviousStep = () => {
    deckRef.current?.stepBackward();
    setTimeout(() => {
      updateSlideInfo();
      if (deckRef.current?.activeView) {
        onPresentationStateChange(
          deckRef.current.activeView.slideIndex,
          deckRef.current.activeView.stepIndex
        );
      }
    }, 0);
  };

  const handleNextStep = () => {
    deckRef.current?.stepForward();
    setTimeout(() => {
      updateSlideInfo();
      if (deckRef.current?.activeView) {
        onPresentationStateChange(
          deckRef.current.activeView.slideIndex,
          deckRef.current.activeView.stepIndex
        );
      }
    }, 0);
  };

  const handleHome = () => {
    deckRef.current?.skipTo({ slideIndex: 0, stepIndex: 0 });
    setTimeout(() => {
      setSlideInfo({ slideIndex: 0, stepIndex: 0 });
      onPresentationStateChange(0, 0);
    }, 0);
  };

  const handleEnd = () => {
    const lastSlide = Math.max(0, current.slideCount - 1);
    deckRef.current?.skipTo({ slideIndex: lastSlide, stepIndex: 0 });
    setTimeout(() => {
      setSlideInfo({ slideIndex: lastSlide, stepIndex: 0 });
      onPresentationStateChange(lastSlide, 0);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
      <div className="text-white text-sm font-mono">
        <div>
          Slide: {current.slideIndex + 1} / {current.slideCount}
        </div>
        <div>Step: {current.stepIndex}</div>
      </div>

      <div className="flex gap-2">
        <Button
          size="small"
          variant="contained"
          onClick={handleHome}
          startIcon={<HomeIcon sx={{ fontSize: '16px' }} />}
          title="Go to first slide"
        >
          First
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handlePreviousSlide}
          startIcon={<SkipPreviousIcon sx={{ fontSize: '16px' }} />}
          title="Previous slide"
        >
          Prev Slide
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleNextSlide}
          startIcon={<SkipNextIcon sx={{ fontSize: '16px' }} />}
          title="Next slide"
        >
          Next Slide
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleEnd}
          startIcon={<GetAppIcon sx={{ fontSize: '16px' }} />}
          title="Go to last slide"
        >
          Last
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          size="small"
          variant="outlined"
          onClick={handlePreviousStep}
          startIcon={<ChevronLeftIcon sx={{ fontSize: '16px' }} />}
          title="Previous step"
        >
          Prev Step
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={handleNextStep}
          startIcon={<ChevronRightIcon sx={{ fontSize: '16px' }} />}
          title="Next step"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};
