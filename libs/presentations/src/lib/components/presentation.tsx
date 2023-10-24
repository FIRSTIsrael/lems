import {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  createContext,
  useImperativeHandle,
  FC,
  RefAttributes,
  ReactNode,
  useId
} from 'react';
import { useCollectSlides } from '../hooks/use-slides';
import useDeckState, { DeckStateAndActions, DeckView } from '../hooks/use-deck-state';

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
  skipTo(options: { slideIndex: number; stepIndex: number }): void;
  stepForward(): void;
  stepBackward(): void;
  advanceSlide(): void;
  regressSlide(): void;
};

export const DeckContext = createContext<DeckContextType>(null as any);

export const DeckInternal = forwardRef<DeckRef, DeckInternalProps>(
  (
    {
      id: userProvidedId,
      children,
      onActiveStateChange: onActiveStateChangeExternal = () => {},
      initialState: initialDeckState = {
        slideIndex: 0,
        stepIndex: 0
      },
      suppressBackdropFallback = false,
      autoPlay = false,
      autoPlayLoop = false,
      autoPlayInterval = 1000,
      transition = defaultTransition,
      backgroundImage
    },
    ref
  ) => {
    const id = useId();
    const [deckId] = useState(userProvidedId || id);

    const {
      initialized,
      pendingView,
      activeView,
      initializeTo,
      skipTo,
      stepForward,
      stepBackward,
      advanceSlide
    } = useDeckState(initialDeckState);

    const [setPlaceholderContainer, slideIds, slideIdsWithTemplates, slideIdsInitialized] =
      useCollectSlides();

    // It really is much easier to just expose methods to the outside world that
    // drive the presentation through its state rather than trying to implement a
    // declarative API.
    useImperativeHandle(
      ref,
      () => ({
        initialized,
        activeView,
        initializeTo,
        skipTo,
        stepForward,
        stepBackward,
        advanceSlide,
        regressSlide,
        numberOfSlides: slideIds.length
      }),
      [
        initialized,
        activeView,
        initializeTo,
        skipTo,
        stepForward,
        stepBackward,
        advanceSlide,
        regressSlide,
        slideIds
      ]
    );

    useEffect(() => {
      if (!initialized) return;
      onActiveStateChange(activeView);
      onActiveStateChangeExternal(activeView);
    }, [initialized, activeView, onActiveStateChange, onActiveStateChangeExternal]);

    useEffect(() => {
      const initialView = syncLocation({
        slideIndex: 0,
        stepIndex: 0
      });
      initializeTo(initialView);
    }, [initializeTo, syncLocation]);

    const handleSlideClick = useCallback<NonNullable<DeckInternalProps['onSlideClick']>>(
      (e, slideId) => {
        const slideIndex = slideIds.indexOf(slideId);
        onSlideClick(e, slideIndex);
      },
      [onSlideClick, slideIds]
    );

    const activeSlideId = slideIds[activeView.slideIndex];
    const pendingSlideId = slideIds[pendingView.slideIndex];

    const fullyInitialized = initialized && slideIdsInitialized;

    // Slides don't actually render their content to their position in the DOM-
    // they render to this `portalNode` element. The only thing they actually
    // render to their "natural" DOM location is a placeholder node which we use
    // below to enumerate them.
    //
    // The main reason for this is so that we can be absolutely sure that no
    // intermediate areas of the tree end up breaking styling, while still
    // allowing users to organize their slides via component nesting:
    //
    //     const ContentSlides = () => (
    //       <>
    //         <Slide>First Slide</Slide>
    //         <p>This text will never appear, because it's not part of a Slide.<p>
    //         <Slide>Second Slide</Slide>
    //       </>
    //     );
    //
    //     const Presentation = () => (
    //       <Deck>
    //         <Slide>Title Slide</Slide>
    //         <ContentSlides />
    //         <Slide>Conclusion Slide</Slide>
    //       </Deck>
    //     );
    const [slidePortalNode, setSlidePortalNode] = useState<HTMLDivElement | null>();

    return (
      <DeckContext.Provider
        value={{
          deckId,
          slideCount: slideIds.length,
          slideIds,
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
          stepForward,
          stepBackward,
          advanceSlide,
          regressSlide
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

export const Presentation = DeckInternal as FC<DeckProps & RefAttributes<DeckRef>>;

export type SlideId = string | number;

export type DeckRef = Omit<
  DeckStateAndActions,
  'cancelTransition' | 'commitTransition' | 'navigationDirection' | 'pendingView'
> & {
  numberOfSlides: number;
};
export type DeckProps = {
  id?: string | number;
  className?: string;
  children: ReactNode;
};
/**
 * These types are only used internally,
 * and are not officially part of the public API
 */
export type DeckInternalProps = DeckProps & {
  initialState?: DeckView;
};

export default Presentation;
