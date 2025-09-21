'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division, Team } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { AwardsProvider } from './components/awards-context';

interface AwardsLayoutProps {
  children: React.ReactNode;
}

export default function AwardsLayout({ children }: AwardsLayoutProps) {
  const event = useEvent();
  const searchParams = useSearchParams();

  const { data: divisions = [] } = useSWR<Division[]>(`/admin/events/${event.id}/divisions`, {
    suspense: true,
    fallbackData: []
  });

  const selectedDivisionId = searchParams.get('division') || divisions[0]?.id;

  const { data: teams = [] } = useSWR<Team[]>(
    selectedDivisionId ? `/admin/events/${event.id}/divisions/${selectedDivisionId}/teams` : null,
    { suspense: true, fallbackData: [] }
  );

  const teamCount = teams.length;

  if (!selectedDivisionId) {
    return <></>;
  }

  return (
    <AwardsProvider divisionId={selectedDivisionId} teamCount={teamCount}>
      {children}
    </AwardsProvider>
  );
}
