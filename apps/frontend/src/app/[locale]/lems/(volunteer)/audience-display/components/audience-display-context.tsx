'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AudienceDisplayState, Award } from '../graphql';

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
  return (
    <AudienceDisplayContext.Provider value={{ displayState, awards, awardsAssigned }}>
      {children}
    </AudienceDisplayContext.Provider>
  );
}

export function useAudienceDisplay(): AudienceDisplayContextData {
  const context = useContext(AudienceDisplayContext);
  if (!context) {
    throw new Error('useAudienceDisplay must be used within a AudienceDisplayProvider');
  }
  return context;
}
