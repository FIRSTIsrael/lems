'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
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

  // TODO: Fetch team count from API based on selected division
  const teamCount = 32; // Hardcoded for now as per requirements

  // Only render children if we have a valid division ID
  if (!selectedDivisionId) {
    return <>{children}</>;
  }

  return (
    <AwardsProvider divisionId={selectedDivisionId} teamCount={teamCount}>
      {children}
    </AwardsProvider>
  );
}
