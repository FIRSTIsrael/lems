import { createContext, useEffect } from 'react';
import { SlideId } from './presentation';
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

  const internalStepIndex = 0; //TODO: implement

  useEffect(() => console.log(finalStepIndex), [finalStepIndex]);

  return (
    <>
      {placeholder}
      <SlideContext.Provider
        value={{ immediate, slideId, activationThresholds, activeStepIndex: internalStepIndex }}
      >
        <div ref={setStepContainer} className={className}>
          {children}
        </div>
      </SlideContext.Provider>
    </>
  );
};
