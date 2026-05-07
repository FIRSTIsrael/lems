'use client';

import useSWR from 'swr';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@mui/material';
import { EventDetails } from '@lems/types/api/portal';
import { DivisionSelector } from './components/division-selector';
import { EventHeader } from './components/event-header';
import { DivisionTabBar } from './components/division-tab-bar';

const EventPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: eventData, error } = useSWR<EventDetails | null>(`/portal/events/${slug}`, {
    suspense: true,
    fallbackData: null
  });

  if (error) throw new Error(`Failed to load event data. Status: ${error.status || 500}`);

  if (!eventData || !eventData.divisions || eventData.divisions.length === 0) {
    return null; // Should be handled by suspense
  }

  const selectedDivisionId = searchParams.get('division') || eventData.divisions[0]?.id;
  const selectedDivision = eventData.divisions.find(division => division.id === selectedDivisionId);

  if (!selectedDivision) {
    // Should never happen but here as a failsafe
    router.replace(`/event/${slug}?division=${eventData.divisions[0]?.id}`);
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <EventHeader eventData={eventData} divisionId={selectedDivision.id} />

      <DivisionSelector divisions={eventData.divisions} />

      <DivisionTabBar divisionId={selectedDivision.id} />
    </Container>
  );
};

export default EventPage;
