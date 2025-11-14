'use client';

import React, { createContext, useContext } from 'react';
import { TeamSummary } from '@lems/types/api/portal';

const TeamContext = createContext<TeamSummary | null>(null);

export function TeamProvider({
  value,
  children
}: {
  value: TeamSummary;
  children: React.ReactNode;
}) {
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export const useTeam = (): TeamSummary => {
  const team = useContext(TeamContext);
  if (!team) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return team;
};
