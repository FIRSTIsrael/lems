'use client';

import React, { createContext, useContext, useState } from 'react';
import { JudgingCategory } from '@lems/types';

interface RubricContextType {
  category: JudgingCategory | null;
  setCategory: (category: JudgingCategory) => void;
}

const RubricContext = createContext<RubricContextType | undefined>(undefined);

export const RubricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [category, setCategory] = useState<JudgingCategory | null>(null);

  return (
    <RubricContext.Provider value={{ category, setCategory }}>{children}</RubricContext.Provider>
  );
};

export const useRubricContext = () => {
  const context = useContext(RubricContext);
  if (!context) {
    throw new Error('useRubricContext must be used within RubricProvider');
  }
  return context;
};
