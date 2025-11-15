'use client';

import React, { createContext, useContext } from 'react';
import useSWR from 'swr';
import { Division } from '@lems/types/api/portal';

const DivisionContext = createContext<Division | null>(null);

interface DivisionProviderProps {
  divisionId: string;
  children: React.ReactNode;
}

export function DivisionProvider({ children, divisionId }: DivisionProviderProps) {
  const { data: divisionData, error } = useSWR<Division | null>(`/portal/divisions/${divisionId}`, {
    suspense: true,
    fallbackData: null
  });

  if (error) {
    throw new Error('Failed to load division');
  }

  if (!divisionData) {
    return null;
  }

  return <DivisionContext.Provider value={divisionData}>{children}</DivisionContext.Provider>;
}

export const useDivision = (): Division => {
  const data = useContext(DivisionContext);
  if (!data) {
    throw new Error('useDivision must be used within a DivisionProvider');
  }
  return data;
};
