'use client';

import React, { createContext, useContext } from 'react';
import type { ScoresheetItem } from './scoresheet.graphql';

interface ScoresheetContextValue {
  scoresheet: ScoresheetItem;
}

const ScoresheetContext = createContext<ScoresheetContextValue | undefined>(undefined);

interface ScoresheetProviderProps {
  scoresheet: ScoresheetItem;
  children: React.ReactNode;
}

export const ScoresheetProvider: React.FC<ScoresheetProviderProps> = ({ scoresheet, children }) => {
  return <ScoresheetContext.Provider value={{ scoresheet }}>{children}</ScoresheetContext.Provider>;
};

export function useScoresheet(): ScoresheetContextValue {
  const context = useContext(ScoresheetContext);
  if (!context) {
    throw new Error('useScoresheet must be used within a ScoresheetProvider');
  }
  return context;
}
