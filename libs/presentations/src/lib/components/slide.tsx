import { createContext, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '@mui/system';
import { SlideId, DeckContext } from './deck';
import { useSlide } from '../hooks/use-slides';
import { ActivationThresholds, useCollectSteps } from '../hooks/use-steps';
import { GOTO_FINAL_STEP } from '../hooks/use-deck-state';

const Div1 = styled('div')({
  width: '100%',
  height: '100%',
  position: 'absolute'
});
const Div2 = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  zIndex: 0,
  '&::before': {
    content: '" "',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1
  }
});
const Div3 = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
});

export type SlideContextType = {
  slideId: SlideId;
  immediate: boolean;
  isSlideActive: boolean;
  activationThresholds: ActivationThresholds;
  activeStepIndex: number;
};

export const SlideContext = createContext<SlideContextType>(null as any);

export interface SlideProps {
  id?: SlideId;
  className?: string;
  children: React.ReactNode;
}

export const Slide: React.FC<SlideProps> = ({ id: userProvidedId, className = '', children }) => {
  const { slideId, placeholder } = useSlide(userProvidedId);
  const { setStepContainer, activationThresholds, finalStepIndex } = useCollectSteps();
  const immediate = false;

  const {
    slideCount,
    slidePortalNode,
    slideIds,
    activeView,
    pendingView,
    advanceSlide,
    regressSlide,
    skipTo,
    navigationDirection,
    commitTransition,
    cancelTransition
  } = useContext(DeckContext);

  const isActive = activeView.slideId === slideId;
  const isPending = pendingView.slideId === slideId;
  const slideIndex = slideIds.findIndex(id => id === slideId);
  const [isPassed, isUpcoming] = (() => {
    // Handle special cases not covered by the main logic below
    if (slideCount === 1) {
      return [false, false];
    }
    if (slideCount === 2) {
      // The 2-slide case results in some janky animation when wrapping from end
      // to start, but that's the best overall behavior that could be achieved
      // without majorly reworking the animation logic.
      if (slideIndex === activeView.slideIndex) {
        return [false, false];
      }
      if (slideIndex === 0) {
        return [true, false];
      }
      return [false, true];
    }
    const isWrappingForward = slideIndex === slideCount - 1 && activeView.slideIndex === 0;
    const isWrappingReverse = slideIndex === 0 && activeView.slideIndex === slideCount - 1;
    const isWrapping = isWrappingForward || isWrappingReverse;
    const isPassed = (!isWrapping && slideIndex < activeView.slideIndex) || isWrappingForward;
    const isUpcoming = (!isWrapping && slideIndex > activeView.slideIndex) || isWrappingReverse;
    return [isPassed, isUpcoming];
  })();

  const willEnter = !isActive && isPending;
  const willExit = isActive && !isPending;

  const slideWillChange = activeView.slideIndex !== pendingView.slideIndex;
  const stepWillChange = activeView.stepIndex !== pendingView.stepIndex;

  const infinityDirection = slideIndex < activeView.slideIndex ? Infinity : -Infinity;
  const internalStepIndex = isActive ? activeView.stepIndex : infinityDirection;

  useEffect(() => {
    if (!isActive) return;
    if (!stepWillChange) return;
    if (slideWillChange) return;

    if (pendingView.stepIndex < 0) {
      regressSlide();
    } else if (pendingView.stepIndex > finalStepIndex) {
      advanceSlide();
    } else if (pendingView.stepIndex === GOTO_FINAL_STEP) {
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else {
      commitTransition();
    }
  }, [
    activeView,
    advanceSlide,
    commitTransition,
    finalStepIndex,
    navigationDirection,
    isActive,
    pendingView,
    regressSlide,
    skipTo,
    slideCount,
    slideWillChange,
    stepWillChange
  ]);

  // Bounds checking for slides in the presentation.
  useEffect(() => {
    if (!willExit) return;
    if (pendingView.slideId === undefined) cancelTransition();
  }, [willExit, cancelTransition, pendingView.slideId]);

  useEffect(() => {
    if (!willEnter) return;
    if (finalStepIndex === undefined) return;

    if (pendingView.stepIndex < 0) {
      commitTransition({
        stepIndex: 0
      });
    } else if (pendingView.stepIndex === GOTO_FINAL_STEP) {
      // Because <Slide> elements enumerate their own steps, nobody else
      // actually knows how many steps are in a slide. So other slides put a
      // value of GOTO_FINAL_STEP in the step index to indicate that the slide
      // should fill in the correct finalStepIndex before we commit the change.
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else if (pendingView.stepIndex > finalStepIndex) {
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else {
      commitTransition();
    }
  }, [activeView, commitTransition, finalStepIndex, navigationDirection, pendingView, willEnter]);

  return (
    <>
      {placeholder}
      <SlideContext.Provider
        value={{
          immediate,
          slideId,
          isSlideActive: isActive,
          activationThresholds,
          activeStepIndex: internalStepIndex
        }}
      >
        {slidePortalNode &&
          createPortal(
            <div
              ref={setStepContainer}
              className={className}
              style={{
                display: isActive ? 'unset' : 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%',
                backgroundColor: '#333',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative' }}>{children}</div>
            </div>,
            slidePortalNode
          )}
      </SlideContext.Provider>
    </>
  );
};
