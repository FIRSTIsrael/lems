'use client';

import React, { createContext, useContext, useState } from 'react';
import { JudgingCategory } from '@lems/types/judging';
import { useRubric, RubricData } from '../hooks/use-rubric';
import { RubricFormValues } from '../rubric-types';

interface RubricContextType {
  category: JudgingCategory;
  setCategory: (category: JudgingCategory) => void;
  rubric: RubricData;
  updateRubric: (values: RubricFormValues) => Promise<void>;
  resetRubric: () => Promise<void>;
  loading: boolean;
}

const RubricContext = createContext<RubricContextType | undefined>(undefined);

export const RubricProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [category, setCategory] = useState<JudgingCategory>('innovation-project');
  const { rubric, updateRubric, resetRubric, loading } = useRubric(category);

  return (
    <RubricContext.Provider
      value={{ category, setCategory, rubric, updateRubric, resetRubric, loading }}
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
