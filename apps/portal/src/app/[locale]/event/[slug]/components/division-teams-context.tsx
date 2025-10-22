'use client';

import React, { createContext, useContext } from 'react';
import { Team } from '@lems/types/api/portal';

const DivisionTeamsContext = createContext<Team[] | null>(null);

export function DivisionTeamsProvider({
  value,
  children
}: {
  value: Team[];
  children: React.ReactNode;
}) {
  return <DivisionTeamsContext.Provider value={value}>{children}</DivisionTeamsContext.Provider>;
}

export const useDivisionTeams = (): Team[] => {
  const teams = useContext(DivisionTeamsContext);
  if (!teams) {
    throw new Error('useDivisionTeams must be used within a DivisionTeamsProvider');
  }
  return teams;
};
