'use client';

import { createContext, useContext } from 'react';

interface TeamContextType {
  id: string;
  name: string;
  number: number;
  affiliation: string;
  city: string;
  logoUrl: string | null;
  slug: string;
  arrived: boolean;
}

const TeamContext = createContext<TeamContextType | null>(null);

export function TeamProvider({
  team,
  children
}: {
  team: TeamContextType;
  children: React.ReactNode;
}) {
  return <TeamContext.Provider value={team}>{children}</TeamContext.Provider>;
}

export function useTeam(): TeamContextType {
  const ctx = useContext(TeamContext);
  if (!ctx) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return ctx;
}
