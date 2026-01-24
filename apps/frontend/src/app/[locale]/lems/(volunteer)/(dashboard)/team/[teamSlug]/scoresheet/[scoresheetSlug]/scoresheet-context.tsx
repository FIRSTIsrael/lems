'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { ScoresheetItem } from './graphql';
import { validateScoresheet, type ScoresheetValidationResult } from './scoresheet-validation';

interface ScoresheetContextValue {
  scoresheet: ScoresheetItem;
  validation: ScoresheetValidationResult;
  forceEdit?: boolean;
}

const ScoresheetContext = createContext<ScoresheetContextValue | undefined>(undefined);

interface ScoresheetProviderProps {
  scoresheet: ScoresheetItem;
  forceEdit?: boolean;
  children: React.ReactNode;
}

export const ScoresheetProvider: React.FC<ScoresheetProviderProps> = ({
  scoresheet,
  forceEdit = false,
  children
}) => {
  const validation = useMemo(() => {
    return validateScoresheet(scoresheet.data);
  }, [scoresheet.data]);

  return (
    <ScoresheetContext.Provider value={{ scoresheet, validation, forceEdit }}>
      {children}
    </ScoresheetContext.Provider>
  );
};

export function useScoresheet(): ScoresheetContextValue {
  const context = useContext(ScoresheetContext);
  if (!context) {
    throw new Error('useScoresheet must be used within a ScoresheetProvider');
  }
  return context;
}
