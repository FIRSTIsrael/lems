import { createContext, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useSlide } from '../hooks/use-slides';
import { ActivationThresholds, useCollectSteps } from '../hooks/use-steps';
import { GOTO_FINAL_STEP } from '../hooks/use-deck-state';
import { SlideId, DeckContext } from './deck';
import { SlideScaler } from './slide-scaler';

export type SlideContextType = {
  slideId: SlideId;
  immediate: boolean;
  isSlideActive: boolean;
  activationThresholds: ActivationThresholds;
  activeStepIndex: number;
};

export const SlideContext = createContext<SlideContextType>(null as never);

export interface SlideProps {
  id?: SlideId;
  className?: string;
  chromaKey?: boolean;
  children: React.ReactNode;
}

export const Slide: React.FC<SlideProps> = ({
  id: userProvidedId,
  className = '',
  chromaKey = false,
  children
}) => {
  const { slideId, placeholder } = useSlide(userProvidedId);
  const { setStepContainer, activationThresholds, finalStepIndex } = useCollectSteps();
  const immediate = false;

  const {
    slidePortalNode,
    slideIds,
    activeView,
    pendingView,
    advanceSlide,
    regressSlide,
    commitTransition,
    cancelTransition
  } = useContext(DeckContext);

  const isActive = activeView.slideId === slideId;
  const isPending = pendingView.slideId === slideId;
  const slideIndex = slideIds.findIndex(id => id === slideId);

  const willEnter = !isActive && isPending;
  const willExit = isActive && !isPending;

  const slideWillChange = activeView.slideIndex !== pendingView.slideIndex;
  const stepWillChange = activeView.stepIndex !== pendingView.stepIndex;

  const infinityDirection = slideIndex < activeView.slideIndex ? Infinity : -Infinity;
  const internalStepIndex = isActive ? activeView.stepIndex : infinityDirection;

  // Handle navigation transitions: step changes on active slide, slide enter/exit
  useEffect(() => {
    // Case 1: Exiting to non-existent slide - cancel
    if (willExit && pendingView.slideId === undefined) {
      cancelTransition();
      return;
    }

    // Case 2: Entering a new slide - validate and commit step bounds
    if (willEnter && finalStepIndex !== undefined) {
      const step = pendingView.stepIndex;
      if (step < 0) {
        commitTransition({ stepIndex: 0 });
      } else if (step === GOTO_FINAL_STEP || step > finalStepIndex) {
        // GOTO_FINAL_STEP is a sentinel for "go to last step of this slide"
        commitTransition({ stepIndex: finalStepIndex });
      } else {
        commitTransition();
      }
      return;
    }

    // Case 3: Step change on active slide - validate bounds
    if (isActive && stepWillChange && !slideWillChange) {
      const step = pendingView.stepIndex;
      if (step < 0) {
        regressSlide();
      } else if (step > finalStepIndex) {
        advanceSlide();
      } else if (step === GOTO_FINAL_STEP) {
        commitTransition({ stepIndex: finalStepIndex });
      } else {
        commitTransition();
      }
    }
  }, [
    isActive,
    willEnter,
    willExit,
    stepWillChange,
    slideWillChange,
    pendingView.slideId,
    pendingView.stepIndex,
    finalStepIndex,
    advanceSlide,
    regressSlide,
    commitTransition,
    cancelTransition
  ]);

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
                backgroundImage: chromaKey
                  ? 'none'
                  : 'url(/assets/audience-display/audience-display-background.webp)',
                backgroundColor: chromaKey ? '#ff00ff' : 'transparent',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                overflow: 'hidden'
              }}
            >
              <SlideScaler>{children}</SlideScaler>
            </div>,
            slidePortalNode
          )}
      </SlideContext.Provider>
    </>
  );
};
