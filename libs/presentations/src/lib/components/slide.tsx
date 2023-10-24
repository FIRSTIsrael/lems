import { createContext, ReactNode, useContext, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import styled, { css, ThemeContext } from 'styled-components';
import { background, BackgroundProps, color, ColorProps, space, SpaceProps } from 'styled-system';
import { DeckContext, SlideId } from './presentation';
import { useSlide } from '../hooks/use-slides';
import { ActivationThresholds, useCollectSteps } from '../hooks/use-steps';
import { GOTO_FINAL_STEP } from '../hooks/use-deck-state';

export type SlideContextType = {
  slideId: SlideId;
  isSlideActive: boolean;
  activationThresholds: ActivationThresholds;
  activeStepIndex: number;
};

export const SlideContext = createContext<SlideContextType>(null as any);
SlideContext.displayName = 'SlideContext';

type SlideContainerProps = BackgroundProps & ColorProps & { backgroundOpacity: number };

const SlideContainer = styled.div<SlideContainerProps>`
  ${color};
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  display: flex;
  z-index: 0;

  &:before {
    ${background};
    content: ' ';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
  }
`;

const SlideWrapper = styled.div<ColorProps & SpaceProps>(
  color,
  space,
  css`
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  `
);

const Slide = (props: SlideProps): JSX.Element => {
  const { id: userProvidedId, children, className = '' } = props;
  if (useContext(SlideContext)) {
    throw new Error(`Slide components may not be nested within each other.`);
  }

  const { slideId, placeholder } = useSlide(userProvidedId);

  const { setStepContainer, activationThresholds, finalStepIndex } = useCollectSteps();
  const {
    slidePortalNode,
    slideIds,
    activeView,
    pendingView,
    advanceSlide,
    regressSlide,
    skipTo,
    slideCount
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

  // If we've already been to this slide, all its elements should be visible; if
  // we haven't gotten to it yet, none of them should be visible. (This helps us
  // handle slides which are exiting but which are still visible while
  // animated.)
  const infinityDirection = slideIndex < activeView.slideIndex ? Infinity : -Infinity;
  const internalStepIndex = isActive ? activeView.stepIndex : infinityDirection;

  useEffect(() => {
    if (!isActive) return;
    if (!stepWillChange) return;
    if (slideWillChange) return;

    if (pendingView.stepIndex < 0) {
      if (autoPlayLoop && activeView.slideIndex === 0) {
        skipTo({ slideIndex: slideCount - 1, stepIndex: GOTO_FINAL_STEP });
      } else {
        regressSlide();
      }
    } else if (pendingView.stepIndex > finalStepIndex) {
      if (autoPlayLoop && activeView.slideIndex === slideCount - 1) {
        skipTo({ slideIndex: 0, stepIndex: 0 });
      } else {
        advanceSlide();
      }
    } else if (pendingView.stepIndex === GOTO_FINAL_STEP) {
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else {
      const isSingleForwardStep = navigationDirection > 0;
      // the step is happening within this slide
      setAnimate(isSingleForwardStep);
      commitTransition();
    }
  }, [
    activeView,
    advanceSlide,
    autoPlayLoop,
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
    if (pendingView.slideId === undefined && !autoPlayLoop) {
      setAnimate(false);
      cancelTransition();
    } else {
      const isSingleForwardStep = navigationDirection > 0;
      setAnimate(isSingleForwardStep);
    }
  }, [
    activeView.slideIndex,
    autoPlayLoop,
    cancelTransition,
    pendingView,
    navigationDirection,
    willExit
  ]);

  useEffect(() => {
    if (!willEnter) return;
    if (finalStepIndex === undefined) return;

    if (pendingView.stepIndex < 0) {
      setAnimate(false);
      commitTransition({
        stepIndex: 0
      });
    } else if (pendingView.stepIndex === GOTO_FINAL_STEP) {
      // Because <Slide> elements enumerate their own steps, nobody else
      // actually knows how many steps are in a slide. So other slides put a
      // value of GOTO_FINAL_STEP in the step index to indicate that the slide
      // should fill in the correct finalStepIndex before we commit the change.
      setAnimate(false);
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else if (pendingView.stepIndex > finalStepIndex) {
      setAnimate(false);
      commitTransition({
        stepIndex: finalStepIndex
      });
    } else {
      const isSingleForwardStep = navigationDirection > 0;

      setAnimate(isSingleForwardStep);
      commitTransition();
    }
  }, [activeView, commitTransition, finalStepIndex, navigationDirection, pendingView, willEnter]);

  return (
    <>
      {placeholder}
      <SlideContext.Provider
        value={{
          slideId,
          isSlideActive: isActive,
          activationThresholds,
          activeStepIndex: internalStepIndex
        }}
      >
        {slidePortalNode &&
          ReactDOM.createPortal(
            <SlideContainer className={className}>
              <SlideWrapper style={scaledWrapperOverrideStyle}>{children}</SlideWrapper>
            </SlideContainer>,
            slidePortalNode
          )}
      </SlideContext.Provider>
    </>
  );
};

export default Slide;

export type SlideProps = {
  id?: SlideId;
  className?: string;
  children: ReactNode;
};
