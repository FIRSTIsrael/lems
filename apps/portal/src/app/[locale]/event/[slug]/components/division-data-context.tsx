'use client';

import React, { createContext, useContext } from 'react';
import useSWR from 'swr';
import { DivisionData } from '@lems/types/api/portal';

const DivisionDataContext = createContext<DivisionData | null>(null);

interface DivisionDataProviderProps {
  divisionId: string;
  children: React.ReactNode;
}

export function DivisionDataProvider({ children, divisionId }: DivisionDataProviderProps) {
  const { data: divisionData, error } = useSWR<DivisionData | null>(
    `/portal/divisions/${divisionId}`,
    {
      suspense: true,
      fallbackData: null
    }
  );

  if (error) {
    throw new Error('Failed to load division data');
  }

  if (!divisionData) {
    return null;
  }

  return (
    <DivisionDataContext.Provider value={divisionData}>{children}</DivisionDataContext.Provider>
  );
}

export const useDivisionData = (): DivisionData => {
  const data = useContext(DivisionDataContext);
  if (!data) {
    throw new Error('useDivisionTeams must be used within a DivisionTeamsProvider');
  }
  return data;
};
