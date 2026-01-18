'use client';

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

export const DeckContext = createContext<DeckContextType>(null as never);

export interface DeckProps {
  id?: string | number;
  initialState: DeckView;
  enableReinitialize?: boolean;
  onViewUpdate?: (newView: DeckView) => void;
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
      enableReinitialize = false,
      onViewUpdate,
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

    const [setPlaceholderContainer, slideIds, slideIdsInitialized] = useCollectSlides(children);

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
      if (onViewUpdate) onViewUpdate(activeView);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialized, activeView]);

    useEffect(() => {
      if (!initialized) return;
      if (!enableReinitialize) return;
      skipTo(initialDeckState);
    }, [enableReinitialize, initialDeckState, initialized, skipTo]);

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

Deck.displayName = 'Deck';

export type DeckRef = Omit<
  DeckStateAndActions,
  'cancelTransition' | 'commitTransition' | 'navigationDirection' | 'pendingView'
> & {
  numberOfSlides: number;
};
