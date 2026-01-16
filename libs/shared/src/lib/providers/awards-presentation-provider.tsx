'use client';

import { createContext, useContext, ReactNode } from 'react';

interface TeamWinner {
  id: string;
  name: string;
  number: string;
  city: string;
  affiliation: string;
}

interface PersonalWinner {
  name: string;
}

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  winner?: PersonalWinner | TeamWinner | null;
}

export interface AwardsPresentationContextData {
  awards: Award[];
  awardsAssigned: boolean;
  awardWinnerSlideStyle: 'chroma' | 'full' | 'both';
  presentationState: {
    slideIndex: number;
    stepIndex: number;
  };
  isAwards: boolean;
}

const AwardsPresentationContext = createContext<AwardsPresentationContextData | null>(null);

export interface AwardsPresentationProviderProps {
  awards?: Award[];
  awardsAssigned?: boolean;
  awardWinnerSlideStyle?: 'chroma' | 'full' | 'both';
  presentationState?: {
    slideIndex: number;
    stepIndex: number;
  };
  isAwards?: boolean;
  children?: ReactNode;
}

export function AwardsPresentationProvider({
  awards = [],
  awardsAssigned = false,
  awardWinnerSlideStyle = 'full',
  presentationState = { slideIndex: 0, stepIndex: 0 },
  isAwards = false,
  children
}: AwardsPresentationProviderProps) {
  return (
    <AwardsPresentationContext.Provider
      value={{
        awards,
        awardsAssigned,
        awardWinnerSlideStyle,
        presentationState,
        isAwards
      }}
    >
      {children}
    </AwardsPresentationContext.Provider>
  );
}

export function useAwardsPresentationContext(): AwardsPresentationContextData {
  const context = useContext(AwardsPresentationContext);
  if (!context) {
    throw new Error(
      'useAwardsPresentationContext must be used within an AwardsPresentationProvider'
    );
  }
  return context;
}
