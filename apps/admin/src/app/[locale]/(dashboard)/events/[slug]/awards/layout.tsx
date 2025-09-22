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

  const { data: teams = [] } = useSWR<Team[]>(
    selectedDivisionId ? `/admin/events/${event.id}/divisions/${selectedDivisionId}/teams` : null,
    { suspense: true, fallbackData: [] }
  );

  const { data: awardsData = [], mutate: mutateAwards } = useSWR(
    selectedDivisionId ? `/admin/events/${event.id}/divisions/${selectedDivisionId}/awards` : null,
    { suspense: true, fallbackData: [] }
  );

  const teamCount = teams.length;
  const initialSchema = parseApiResponseToSchema(awardsData);

  if (!selectedDivisionId) {
    return <></>;
  }

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
