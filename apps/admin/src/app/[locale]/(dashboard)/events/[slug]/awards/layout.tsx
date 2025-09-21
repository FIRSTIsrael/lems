'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Division } from '@lems/types/api/admin';
import { useEvent } from '../components/event-context';
import { AwardsProvider } from './context';

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

  // Only render children if we have a valid division ID
  if (!selectedDivisionId) {
    return <>{children}</>;
  }

  return <AwardsProvider divisionId={selectedDivisionId}>{children}</AwardsProvider>;
}
