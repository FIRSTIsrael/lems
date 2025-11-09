'use client';

import React, { createContext, useContext } from 'react';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import { TeamAtEventData } from '@lems/types/api/portal';

const TeamAtEventDataContext = createContext<TeamAtEventData | null>(null);

interface TeamAtEventDataProviderProps {
  children: React.ReactNode;
}

export function TeamAtEventDataProvider({ children }: TeamAtEventDataProviderProps) {
  const params = useParams();
  const eventSlug = params.slug as string;
  const teamNumber = parseInt(params.number as string, 10); // This will error if not str, thats fine

  const { data: teamData, error } = useSWR<TeamAtEventData | null>(
    `/portal/events/${eventSlug}/teams/${teamNumber}`,
    { suspense: true, fallbackData: null }
  );

  if (error) {
    throw new Error('Failed to load team at event data');
  }

  if (!teamData) {
    return null; // Should be handled by suspense boundary
  }

  return (
    <TeamAtEventDataContext.Provider value={teamData}>{children}</TeamAtEventDataContext.Provider>
  );
}

export const useTeamAtEventData = (): TeamAtEventData => {
  const data = useContext(TeamAtEventDataContext);
  if (!data) {
    throw new Error('useTeamAtEventData must be used within a TeamAtEventDataProvider');
  }
  return data;
};
