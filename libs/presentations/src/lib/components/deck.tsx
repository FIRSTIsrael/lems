import { createContext, useEffect, useId, useState, forwardRef, useImperativeHandle } from 'react';
import { useCollectSlides } from '../hooks/use-slides';
import useDeckState, { DeckStateAndActions, DeckView } from '../hooks/use-deck-state';

export type SlideId = string | number;

export type DeckContextType = {
  deckId: string | number;
  slideCount: number;
  slideIds: SlideId[];
  navigationDirection: number;
  slidePortalNode: HTMLDivElement;
  initialized: boolean;
  activeView: {
    slideId: SlideId;
    slideIndex: number;
    stepIndex: number;
  };
  pendingView: {
    slideId: SlideId;
    slideIndex: number;
    stepIndex: number;
  };
  skipTo(options: { slideIndex: number; stepIndex: number }): void;
  advanceSlide(): void;
  regressSlide(): void;
  commitTransition(newView?: { stepIndex: number }): void;
  cancelTransition(): void;
};

export const DeckContext = createContext<DeckContextType>(null as any);

export interface DeckProps {
  id?: string | number;
  initialState: DeckView;
  callback?: (view: DeckView) => void;
  children?: React.ReactNode;
}

export const Deck = forwardRef<DeckRef, DeckProps>(
  (
    {
      id: userProvidedId,
      initialState: initialDeckState = {
        slideIndex: 0,
        stepIndex: 0
      },
      callback,
      children
    },
    ref
  ) => {
    const id = useId();
    const [deckId] = useState(userProvidedId || id);

    const {
      initialized,
      pendingView,
      activeView,
      navigationDirection,
      skipTo,
      initializeTo,
      advanceSlide,
      regressSlide,
      stepForward,
      stepBackward,
      commitTransition,
      cancelTransition
    } = useDeckState(initialDeckState);

    const [setPlaceholderContainer, slideIds, slideIdsInitialized] = useCollectSlides();

    useImperativeHandle(
      ref,
      () => ({
        initialized,
        activeView,
        initializeTo,
        skipTo,
        advanceSlide,
        regressSlide,
        numberOfSlides: slideIds.length,
        stepBackward,
        stepForward
      }),
      [
        initialized,
        activeView,
        skipTo,
        initializeTo,
        advanceSlide,
        regressSlide,
        slideIds,
        stepBackward,
        stepForward
      ]
    );

    useEffect(() => {
      if (!initialized) return;
      if (callback) callback(activeView);
    }, [initialized, activeView, callback]);

    useEffect(() => {
      initializeTo(initialDeckState);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initializeTo]);

    const activeSlideId = slideIds[activeView.slideIndex];
    const pendingSlideId = slideIds[pendingView.slideIndex];

    const fullyInitialized = initialized && slideIdsInitialized;

    const [slidePortalNode, setSlidePortalNode] = useState<HTMLDivElement | null>();

    return (
      <DeckContext.Provider
        value={{
          deckId,
          slideCount: slideIds.length,
          slideIds,
          navigationDirection,
          //TODO: fix
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          slidePortalNode: slidePortalNode!,
          initialized: fullyInitialized,
          activeView: {
            ...activeView,
            slideId: activeSlideId
          },
          pendingView: {
            ...pendingView,
            slideId: pendingSlideId
          },
          skipTo,
          advanceSlide,
          regressSlide,
          commitTransition,
          cancelTransition
        }}
      >
        <div ref={setSlidePortalNode}></div>
        <div ref={setPlaceholderContainer} style={{ display: 'none' }}>
          {children}
        </div>
      </DeckContext.Provider>
    );
  }
);

export type DeckRef = Omit<
  DeckStateAndActions,
  'cancelTransition' | 'commitTransition' | 'navigationDirection' | 'pendingView'
> & {
  numberOfSlides: number;
};
