'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Container } from '@mui/material';
import useSWR from 'swr';
import { EventSummary, Season } from '@lems/types/api/portal';
import { EventsPageHeader } from './components/events-page-header';
import { EventsSearchSection } from './components/events-search-section';
import { EventsListSection } from './components/event-list-section';

export default function EventsPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterTab, setFilterTab] = React.useState(0);

  const query = useSearchParams();
  const season = query.get('season') ?? 'latest';

  const { data: seasonData } = useSWR<Season | null>(`/portal/seasons/${season}`, {
    suspense: true,
    fallbackData: null
  });

  const { data: seasonEvents = [] } = useSWR<EventSummary[]>(
    () => (seasonData ? `/portal/events?season=${seasonData.slug}` : null),
    { suspense: true, fallbackData: [] }
  );

  const { data: seasons = [] } = useSWR<Season[]>('/portal/seasons', {
    suspense: true,
    fallbackData: []
  });

  if (!seasonData) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <EventsPageHeader currentSeason={seasonData} seasons={seasons} />

        <EventsSearchSection
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          events={seasonEvents}
        />

        <EventsListSection events={seasonEvents} searchValue={searchValue} filterTab={filterTab} />
      </Container>
    </Box>
  );
}
