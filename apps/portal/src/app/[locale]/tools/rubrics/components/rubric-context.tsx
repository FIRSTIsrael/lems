'use client';

import React, { createContext, useContext, useState } from 'react';
import { JudgingCategory } from '@lems/types';

interface RubricContextType {
  category: JudgingCategory | null;
  setCategory: (category: JudgingCategory) => void;
  teamName: string;
  setTeamName: (name: string) => void;
  teamNumber: number;
  setTeamNumber: (number: number) => void;
}

const RubricContext = createContext<RubricContextType | undefined>(undefined);

export const RubricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [category, setCategory] = useState<JudgingCategory | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamNumber, setTeamNumber] = useState(0);

  return (
    <RubricContext.Provider
      value={{
        category,
        setCategory,
        teamName,
        setTeamName,
        teamNumber,
        setTeamNumber
      }}
    >
      {children}
    </RubricContext.Provider>
  );
};

export const useRubricContext = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubricContext must be used within RubricProvider');
  }
  return context;
};
