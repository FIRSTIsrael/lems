'use client';

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { HeadQueuerData, RobotGameMatch, RobotGameTable } from '../graphql/types';

interface FieldHeadQueuerContextType {
  divisionId: string;
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
  loading: boolean;
}

const FieldHeadQueuerContext = createContext<FieldHeadQueuerContextType | null>(null);

interface FieldHeadQueuerProviderProps {
  divisionId: string;
  data: HeadQueuerData;
  loading: boolean;
  children?: ReactNode;
}

export function FieldHeadQueuerProvider({
  divisionId,
  data,
  loading,
  children
}: FieldHeadQueuerProviderProps) {
  const value = useMemo<FieldHeadQueuerContextType>(
    () => ({
      divisionId,
      matches: data.matches,
      tables: data.tables,
      activeMatch: data.activeMatch,
      loadedMatch: data.loadedMatch,
      loading
    }),
    [divisionId, data.matches, data.tables, data.activeMatch, data.loadedMatch, loading]
  );

  return <FieldHeadQueuerContext.Provider value={value}>{children}</FieldHeadQueuerContext.Provider>;
}

export function useFieldHeadQueuer() {
  const context = useContext(FieldHeadQueuerContext);
  if (!context) {
    throw new Error('useFieldHeadQueuer must be used within FieldHeadQueuerProvider');
  }
  return context;
}
