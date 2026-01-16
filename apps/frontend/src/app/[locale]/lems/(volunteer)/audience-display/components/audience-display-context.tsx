'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { AwardsPresentationProvider } from '@lems/shared/providers';
import type { Award as PresentationAward } from '@lems/shared/providers';
import type { AudienceDisplayState } from '../graphql';

type AwardWinnerSlideStyle = 'chroma' | 'full' | 'both';

interface AudienceDisplayContextData {
  displayState: AudienceDisplayState;
  awards: PresentationAward[];
  awardsAssigned: boolean;
}

const AudienceDisplayContext = createContext<AudienceDisplayContextData | null>(null);

interface AudienceDisplayProviderProps {
  displayState: AudienceDisplayState;
  awards?: PresentationAward[];
  awardsAssigned?: boolean;
  children?: ReactNode;
}

export function AudienceDisplayProvider({
  displayState,
  awards = [],
  awardsAssigned = false,
  children
}: AudienceDisplayProviderProps) {
  const getAwardWinnerSlideStyle = (): AwardWinnerSlideStyle => {
    const value = displayState.settings?.awards?.awardWinnerSlideStyle;
    if (value === 'chroma' || value === 'full' || value === 'both') {
      return value;
    }
    return 'both';
  };

  const awardWinnerSlideStyle = getAwardWinnerSlideStyle();
  // Read presentationState from awardsPresentation (where PRESENTATION_UPDATED_SUBSCRIPTION updates it)
  const presentationState =
    displayState.awardsPresentation != null
      ? displayState.awardsPresentation
      : { slideIndex: 0, stepIndex: 0 };

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
        isAwards={displayState.activeDisplay === 'awards'}
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
