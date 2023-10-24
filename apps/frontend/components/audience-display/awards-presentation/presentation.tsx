import { createContext } from 'react';

type SlideId = string | number;

type PresentationContextType = {
  presentationId: string | number;
  slideCount: number;
  slideIds: SlideId[];
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

export const PresentationContext = createContext<PresentationContextType>(null as any);

const Presentation: React.FC = () => {
  return <p>yes</p>;
};

export default Presentation;
