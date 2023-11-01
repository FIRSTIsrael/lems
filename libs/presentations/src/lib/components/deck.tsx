import { createContext, useEffect, useId, useState } from 'react';
import { styled } from '@mui/system';
import { useCollectSlides } from '../hooks/use-slides';
import useDeckState, { DeckView } from '../hooks/use-deck-state';

export type SlideId = string | number;

export type DeckContextType = {
  deckId: string | number;
  slideCount: number;
  slideIds: SlideId[];
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
};

export const DeckContext = createContext<DeckContextType>(null as any);

const Portal = styled('div')(() => [
  {
    overflow: 'hidden',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    transform: 'scale(1)',
    overflowY: 'scroll',
    width: '100%',
    height: '100%'
  }
]);

export interface DeckProps {
  id?: string | number;
  initialState: DeckView;
  children?: React.ReactNode;
}

export const Deck: React.FC<DeckProps> = ({
  id: userProvidedId,
  initialState: initialDeckState = {
    slideIndex: 0,
    stepIndex: 0
  },
  // TODO: the initial deck state does not affect what is displayed
  children
}) => {
  const id = useId();
  const [deckId] = useState(userProvidedId || id);

  const {
    initialized,
    pendingView,
    activeView,
    navigationDirection,

    initializeTo,
    skipTo,
    stepForward,
    stepBackward,
    advanceSlide,
    regressSlide,
    commitTransition,
    cancelTransition
  } = useDeckState(initialDeckState);

  const [setPlaceholderContainer, slideIds, slideIdsInitialized] = useCollectSlides();
  useEffect(() => console.log(slideIds), [slideIds]);

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
        }
      }}
    >
      <Portal ref={setSlidePortalNode}></Portal>
      <div ref={setPlaceholderContainer} style={{ display: 'none' }}>
        {children}
      </div>
    </DeckContext.Provider>
  );
};
