import { useContext, createContext } from 'react';
import { createPortal } from 'react-dom';
import { styled } from '@mui/system';
import { PresentationContext, SlideId } from './presentation';
import { TemplateWrapper } from './template-wrapper';
import { useSlide } from '../hooks/use-slides';
import { useCollectSteps } from '../hooks/use-steps';
import { ActivationThresholds } from '../hooks/use-steps';

export type SlideContextType = {
  // immediate: boolean;
  slideId: SlideId;
  // isSlideActive: boolean;
  activationThresholds: ActivationThresholds;
  // activeStepIndex: number;
};

export const SlideContext = createContext<SlideContextType>(null as any);

const SlideContainer = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  zIndex: 0,

  '&:before': {
    content: ' ',
    position: 'absoulte',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    opacity: '100%'
  }
});

const SlideWrapper = styled('div')({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start'
});

interface SlideProps {
  id?: SlideId;
  className?: string;
  children?: React.ReactNode;
  padding?: string | number;
  textColor?: string;
}

const Slide: React.FC<SlideProps> = ({
  id: userProvidedId,
  className,
  children,
  padding,
  textColor
}) => {
  if (useContext(SlideContext)) {
    throw new Error(`Slide components may not be nested within each other.`);
  }

  const { slideId, placeholder } = useSlide(userProvidedId);
  const { setStepContainer, activationThresholds, finalStepIndex } = useCollectSteps();

  const { deckId, slideCount, slideIds, slidePortalNode } = useContext(PresentationContext);

  // const isActive = activeView.slideId === slideId;
  // const isPending = pendingView.slideId === slideId;
  // const slideIndex = slideIds.findIndex(id => id === slideId);
  // const [isPassed, isUpcoming] = (() => {
  //   // Handle special cases not covered by the main logic below
  //   if (slideCount === 1) {
  //     return [false, false];
  //   }
  //   if (slideCount === 2) {
  //     // The 2-slide case results in some janky animation when wrapping from end
  //     // to start, but that's the best overall behavior that could be achieved
  //     // without majorly reworking the animation logic.
  //     if (slideIndex === activeView.slideIndex) {
  //       return [false, false];
  //     }
  //     if (slideIndex === 0) {
  //       return [true, false];
  //     }
  //     return [false, true];
  //   }

  //   const isWrappingForward = slideIndex === slideCount - 1 && activeView.slideIndex === 0;
  //   const isWrappingReverse = slideIndex === 0 && activeView.slideIndex === slideCount - 1;
  //   const isWrapping = isWrappingForward || isWrappingReverse;
  //   const isPassed = (!isWrapping && slideIndex < activeView.slideIndex) || isWrappingForward;
  //   const isUpcoming = (!isWrapping && slideIndex > activeView.slideIndex) || isWrappingReverse;
  //   return [isPassed, isUpcoming];
  // })();

  // const willEnter = !isActive && isPending;
  // const willExit = isActive && !isPending;

  // const slideWillChange = activeView.slideIndex !== pendingView.slideIndex;
  // const stepWillChange = activeView.stepIndex !== pendingView.stepIndex;

  // useEffect(() => {
  //   if (!isActive) return;
  //   if (!stepWillChange) return;
  //   if (slideWillChange) return;

  //   if (pendingView.stepIndex < 0) {
  //     setAnimate(false);

  //     if (autoPlayLoop && activeView.slideIndex === 0) {
  //       skipTo({ slideIndex: slideCount - 1, stepIndex: GOTO_FINAL_STEP });
  //     } else {
  //       regressSlide();
  //     }
  //   } else if (pendingView.stepIndex > finalStepIndex) {
  //     setAnimate(true);

  //     if (autoPlayLoop && activeView.slideIndex === slideCount - 1) {
  //       skipTo({ slideIndex: 0, stepIndex: 0 });
  //     } else {
  //       advanceSlide();
  //     }
  //   } else if (pendingView.stepIndex === GOTO_FINAL_STEP) {
  //     setAnimate(false);
  //     commitTransition({
  //       stepIndex: finalStepIndex
  //     });
  //   } else {
  //     const isSingleForwardStep = navigationDirection > 0;
  //     // the step is happening within this slide
  //     setAnimate(isSingleForwardStep);
  //     commitTransition();
  //   }
  // }, [
  //   activeView,
  //   finalStepIndex,
  //   isActive,
  //   pendingView,
  //   slideCount,
  //   slideWillChange,
  //   stepWillChange
  // ]);

  return (
    <>
      {placeholder}
      <SlideContext.Provider
        value={{
          // immediate,
          slideId,
          // isSlideActive: isActive,
          activationThresholds
          // activeStepIndex: internalStepIndex
        }}
      >
        {slidePortalNode &&
          createPortal(
            <div ref={setStepContainer}>
              <SlideContainer className={className}>
                <TemplateWrapper></TemplateWrapper>
                <SlideWrapper>{children}</SlideWrapper>
              </SlideContainer>
            </div>,
            slidePortalNode
          )}
      </SlideContext.Provider>
    </>
  );
};

export default Slide;
