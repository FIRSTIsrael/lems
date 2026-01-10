'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AudienceDisplayState, Award } from '../graphql';

interface AudienceDisplayContextData {
  displayState: AudienceDisplayState;
  awards: Award[];
}

const AudienceDisplayContext = createContext<AudienceDisplayContextData | null>(null);

interface AudienceDisplayProviderProps {
  displayState: AudienceDisplayState;
  awards?: Award[];
  children?: ReactNode;
}

export function AudienceDisplayProvider({
  displayState,
  awards = [],
  children
}: AudienceDisplayProviderProps) {
  return (
    <AudienceDisplayContext.Provider value={{ displayState, awards }}>
      {children}
    </AudienceDisplayContext.Provider>
  );
}

export function useAudienceDisplayData(): AudienceDisplayState {
  const context = useContext(AudienceDisplayContext);
  if (!context) {
    throw new Error('useAudienceDisplayData must be used within a AudienceDisplayProvider');
  }
  return context.displayState;
}

export function useAwards(): Award[] {
  const context = useContext(AudienceDisplayContext);
  if (!context) {
    throw new Error('useAwards must be used within a AudienceDisplayProvider');
  }
  return context.awards;
}
