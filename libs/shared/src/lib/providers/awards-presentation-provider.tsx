'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface AudienceDisplayState {
  activeDisplay: 'scoreboard' | 'match_preview' | 'sponsors' | 'logo' | 'message' | 'awards';
  settings?: Record<string, Record<string, unknown>>;
}

interface TeamWinner {
  id: string;
  name: string;
  number: string;
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
  displayState?: AudienceDisplayState;
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
  displayState?: AudienceDisplayState;
  children?: ReactNode;
}

export function AwardsPresentationProvider({
  awards = [],
  awardsAssigned = false,
  awardWinnerSlideStyle = 'both',
  presentationState = { slideIndex: 0, stepIndex: 0 },
  displayState,
  children
}: AwardsPresentationProviderProps) {
  return (
    <AwardsPresentationContext.Provider
      value={{
        awards,
        awardsAssigned,
        awardWinnerSlideStyle,
        presentationState,
        displayState
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
