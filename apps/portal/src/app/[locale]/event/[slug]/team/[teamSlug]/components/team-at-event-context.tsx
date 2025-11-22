'use client';

import React, { createContext, useContext } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { TeamAtEventData } from '@lems/types/api/portal';

const TeamAtEventDataContext = createContext<TeamAtEventData | null>(null);

interface TeamAtEventProviderProps {
  children: React.ReactNode;
}

export function TeamAtEventProvider({ children }: TeamAtEventProviderProps) {
  const params = useParams();
  const eventSlug = params.slug as string;
  const teamSlug = params.teamSlug as string;

  const { data: teamAtEvent, error } = useSWR<TeamAtEventData | null>(
    `/portal/events/${eventSlug}/teams/${teamSlug}`,
    { suspense: true, fallbackData: null }
  );

  if (error) throw new Error(`Failed to load team at event data. Status: ${error.status || 500}`);

  if (!teamAtEvent) {
    return null; // Should be handled by suspense boundary
  }

  return (
    <TeamAtEventDataContext.Provider value={teamAtEvent}>
      {children}
    </TeamAtEventDataContext.Provider>
  );
}

export const useTeamAtEvent = (): TeamAtEventData => {
  const data = useContext(TeamAtEventDataContext);
  if (!data) {
    throw new Error('useTeamAtEventData must be used within a TeamAtEventDataProvider');
  }
  return data;
};
