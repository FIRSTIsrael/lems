'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { AwardsPresentationProvider } from '@lems/shared';
import type { AudienceDisplayState, Award } from '../graphql';

interface AudienceDisplayContextData {
  displayState: AudienceDisplayState;
  awards: Award[];
  awardsAssigned: boolean;
}

const AudienceDisplayContext = createContext<AudienceDisplayContextData | null>(null);

interface AudienceDisplayProviderProps {
  displayState: AudienceDisplayState;
  awards?: Award[];
  awardsAssigned?: boolean;
  children?: ReactNode;
}

export function AudienceDisplayProvider({
  displayState,
  awards = [],
  awardsAssigned = false,
  children
}: AudienceDisplayProviderProps) {
  const awardWinnerSlideStyle =
    (displayState.settings?.awards?.awardWinnerSlideStyle as 'chroma' | 'full' | 'both') || 'both';
  const presentationState = (displayState.settings?.awards?.presentationState as {
    slideIndex: number;
    stepIndex: number;
  }) || { slideIndex: 0, stepIndex: 0 };

  const contextValue = useMemo<AudienceDisplayContextData>(
    () => ({
      displayState,
      awards,
      awardsAssigned
    }),
    [displayState, awards, awardsAssigned]
  );

  return (
    <AudienceDisplayContext.Provider value={contextValue}>
      <AwardsPresentationProvider
        displayState={displayState}
        awards={awards}
        awardsAssigned={awardsAssigned}
        awardWinnerSlideStyle={awardWinnerSlideStyle}
        presentationState={presentationState}
      >
        {children}
      </AwardsPresentationProvider>
    </AudienceDisplayContext.Provider>
  );
}

export function useAudienceDisplay(): AudienceDisplayContextData {
  const context = useContext(AudienceDisplayContext);
  if (!context) {
    throw new Error('useAudienceDisplay must be used within an AudienceDisplayProvider');
  }
  return context;
}
