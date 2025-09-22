'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division, Team } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { AwardsProvider } from './components/awards-context';
import { parseApiResponseToSchema } from './utils/schema';

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

  const { data: teams = null } = useSWR<Team[]>(
    selectedDivisionId ? `/admin/events/${event.id}/divisions/${selectedDivisionId}/teams` : null,
    { suspense: true }
  );

  const { data: awardsData = null, mutate: mutateAwards } = useSWR(
    selectedDivisionId ? `/admin/events/${event.id}/divisions/${selectedDivisionId}/awards` : null,
    { suspense: true }
  );

  if (!selectedDivisionId || !awardsData || !teams) {
    return <></>;
  }

  const teamCount = teams.length;
  const initialSchema = parseApiResponseToSchema(awardsData);

  return (
    <AwardsProvider
      divisionId={selectedDivisionId}
      teamCount={teamCount}
      initialSchema={initialSchema}
      onSchemaChange={mutateAwards}
    >
      {children}
    </AwardsProvider>
  );
}
