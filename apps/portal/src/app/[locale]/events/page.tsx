'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import useSWR from 'swr';
import { EventSummary, Season } from '@lems/types/api/portal';
import EventsPageHeader from './components/events-page-header';
import EventsSearchSection from './components/events-search-section';
import EventsListSection from './components/event-list-section';

export default function EventsPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterTab, setFilterTab] = React.useState(0);

  const { data: latestSeason } = useSWR<Season | null>('/portal/seasons/latest', {
    suspense: true,
    fallbackData: null
  });

  const { data: seasonEvents } = useSWR<EventSummary[]>(
    () => `/portal/events?season=${latestSeason?.slug}`,
    {
      suspense: true,
      fallbackData: []
    }
  );

  const { data: seasons } = useSWR<Season[]>('/portal/seasons', {
    suspense: true,
    fallbackData: []
  });

  if (!latestSeason || !seasonEvents || !seasons) {
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
        <EventsPageHeader currentSeason={latestSeason} seasons={seasons} />

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
