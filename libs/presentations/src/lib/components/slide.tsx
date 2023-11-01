import { createContext, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { SlideId, DeckContext } from './deck';
import { useSlide } from '../hooks/use-slides';
import { ActivationThresholds, useCollectSteps } from '../hooks/use-steps';

export type SlideContextType = {
  slideId: SlideId;
  immediate: boolean;
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

  useEffect(() => console.log(finalStepIndex), [finalStepIndex]);

  const { slideCount, slidePortalNode, slideIds, activeView, pendingView } =
    useContext(DeckContext);

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

  return (
    <>
      {placeholder}
      <SlideContext.Provider
        value={{ immediate, slideId, activationThresholds, activeStepIndex: internalStepIndex }}
      >
        {slidePortalNode &&
          createPortal(
            <div ref={setStepContainer} className={className}>
              {children}
            </div>,
            slidePortalNode
          )}
      </SlideContext.Provider>
    </>
  );
};
