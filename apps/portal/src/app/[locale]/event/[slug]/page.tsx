'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@mui/material';
import useSWR from 'swr';
import { EventDetails } from '@lems/types/api/portal';
import { EventDivisionSelector } from './components/event-division-selector';
import { EventHeader } from './components/event-header';
import { EventDivision } from './components/event-division';

const EventPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: eventData } = useSWR<EventDetails | null>(`/portal/events/${slug}`, {
    suspense: true,
    fallbackData: null
  });

  if (!eventData || !eventData.divisions || eventData.divisions.length === 0) {
    return null;
  }

  const divisionId = searchParams.get('divisionId') ?? eventData.divisions[0].id;

  const handleDivisionSelect = (selectedDivisionId: string) => {
    router.push(`/event/${slug}?divisionId=${selectedDivisionId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <EventHeader
        seasonName={eventData.seasonName}
        seasonSlug={eventData.seasonSlug}
        eventName={eventData.name}
        startDate={eventData.startDate}
        location={eventData.location}
      />

      <EventDivisionSelector
        divisions={eventData.divisions}
        currentDivisionId={divisionId}
        onDivisionSelect={handleDivisionSelect}
      />

      <EventDivision divisionId={divisionId} />
    </Container>
  );
};

export default EventPage;
