'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import useSWR from 'swr';
import { EventSummary, Season } from '@lems/types/api/portal';
import { useParams } from 'next/navigation';
import EventsPageHeader from '../components/events-page-header';
import EventsSearchSection from '../components/events-search-section';
import EventsListSection from '../components/event-list-section';

export default function EventsSeasonPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterTab, setFilterTab] = React.useState(0);

  const { season } = useParams();

  const { data: seasonData } = useSWR<Season | null>(`/portal/seasons/${season}`, {
    suspense: true,
    fallbackData: null
  });

  const { data: seasonEvents } = useSWR<EventSummary[]>(() => `/portal/events?season=${season}`, {
    suspense: true,
    fallbackData: []
  });

  const { data: seasons } = useSWR<Season[]>('/portal/seasons', {
    suspense: true,
    fallbackData: []
  });

  if (!seasonData || !seasonEvents || !seasons) {
    return null;
  }

  const eventCounts = {
    all: seasonEvents.length,
    active: seasonEvents.filter(event => event.status === 'active').length,
    upcoming: seasonEvents.filter(event => event.status === 'upcoming').length,
    past: seasonEvents.filter(event => event.status === 'past').length
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <EventsPageHeader currentSeason={seasonData} seasons={seasons} />

        <EventsSearchSection
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          eventCounts={eventCounts}
        />

        <EventsListSection events={seasonEvents} searchValue={searchValue} filterTab={filterTab} />
      </Container>
    </Box>
  );
}
