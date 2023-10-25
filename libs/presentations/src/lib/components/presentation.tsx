import { useState, useId, createContext } from 'react';
import { styled } from '@mui/system';
import { TemplateWrapper } from './template-wrapper';
import { useCollectSlides } from '../hooks/use-slides';

export type SlideId = string | number;

export type PresentationContextType = {
  deckId: string | number;
  slideCount: number;
  slideIds: SlideId[];
  slidePortalNode: HTMLDivElement;
  // initialized: boolean;
  // activeView: {
  //   slideId: SlideId;
  //   slideIndex: number;
  //   stepIndex: number;
  // };
  // pendingView: {
  //   slideId: SlideId;
  //   slideIndex: number;
  //   stepIndex: number;
  // };
};

export const PresentationContext = createContext<PresentationContextType>(null as any);

const Portal = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  alignContent: 'flex-start',
  transform: 'scale(1)',
  overflowY: 'scroll',
  width: '100%',
  height: '100%'
});

interface PresentationProps {
  id: string;
  children?: React.ReactNode;
}

export const Presentation: React.FC<PresentationProps> = ({ id: userProvidedId, children }) => {
  const id = useId();
  const [deckId] = useState(userProvidedId || id);

  const [setPlaceholderContainer, slideIds, slideIdsInitialized] = useCollectSlides();

  // const activeSlideId = slideIds[activeView.slideIndex];
  // const pendingSlideId = slideIds[pendingView.slideIndex];
  // const fullyInitialized = initialized && slideIdsInitialized;

  const [slidePortalNode, setSlidePortalNode] = useState<HTMLDivElement | null>();

  return (
    <PresentationContext.Provider
      value={{
        deckId,
        slideCount: slideIds.length,
        slideIds,
        slidePortalNode: slidePortalNode!
        // initialized: fullyInitialized,
        // activeView: {
        //   ...activeView,
        //   slideId: activeSlideId
        // },
        // pendingView: {
        //   ...pendingView,
        //   slideId: pendingSlideId
        // }
      }}
    >
      <Portal ref={setSlidePortalNode}>
        <TemplateWrapper style={{ zIndex: 1 }}></TemplateWrapper>
      </Portal>
      <div ref={setPlaceholderContainer} style={{ display: 'none' }}>
        {children}
      </div>
    </PresentationContext.Provider>
  );
};
