'use client';

import { createContext, useContext, ReactNode } from 'react';
import { AudienceDisplayState } from '../audience-display.graphql';

const AudienceDisplayContext = createContext<AudienceDisplayState | null>(null);

interface AudienceDisplayProviderProps {
  data: AudienceDisplayState;
  children?: ReactNode;
}

export function AudienceDisplayProvider({ data, children }: AudienceDisplayProviderProps) {
  return <AudienceDisplayContext.Provider value={data}>{children}</AudienceDisplayContext.Provider>;
}

export function useAudienceDisplayData(): AudienceDisplayState {
  const context = useContext(AudienceDisplayContext);
  if (!context) {
    throw new Error('useAudienceDisplayData must be used within a AudienceDisplayProvider');
  }
  return context;
}
