'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { FieldData } from './graphql';

interface ScoreboardContextValue extends FieldData {
  previousMatch: string | null;
}

const ScoreboardContext = createContext<ScoreboardContextValue | undefined>(undefined);
interface ScoreboardProviderProps {
  fieldData: FieldData;
  children: React.ReactNode;
}

export const ScoreboardProvider: React.FC<ScoreboardProviderProps> = ({ fieldData, children }) => {
  const previousMatch = useMemo(() => {
    const matches = [...fieldData.matches].reverse();
    return (
      matches.find(match => match.status === 'completed' && match.stage === fieldData.currentStage)
        ?.id || null
    );
  }, [fieldData.matches, fieldData.currentStage]);

  return (
    <ScoreboardContext.Provider value={{ ...fieldData, previousMatch }}>
      {children}
    </ScoreboardContext.Provider>
  );
};

export function useScoreboard(): ScoreboardContextValue {
  const context = useContext(ScoreboardContext);
  if (!context) {
    throw new Error('useScoreboard must be used within a ScoreboardProvider');
  }
  return context;
}
