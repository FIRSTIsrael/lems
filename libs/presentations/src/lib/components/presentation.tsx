import { useEffect } from 'react';
import { useCollectSlides } from '../hooks/use-slides';

export type SlideId = string | number;

export interface PresentationProps {
  children?: React.ReactNode;
}

export const Presentation: React.FC<PresentationProps> = ({ children }) => {
  const [setPlaceholderContainer, slideIds, slideIdsInitialized] = useCollectSlides();

  useEffect(() => console.log(slideIds), [slideIds]);

  return (
    <div ref={setPlaceholderContainer} style={{ display: 'none' }}>
      {children}
    </div>
  );
};
