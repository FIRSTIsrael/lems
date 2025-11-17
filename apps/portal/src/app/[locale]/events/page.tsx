'use client';

import React, { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Container } from '@mui/material';
import useSWR from 'swr';
import { EventSummary, Season } from '@lems/types/api/portal';
import { EventsPageHeader } from './components/events-page-header';
import { EventsSearchSection } from './components/events-search-section';
import { EventsListSection } from './components/event-list-section';
import { EventFilter } from './event-filter';

export default function EventsPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterTab, setFilterTab] = React.useState(EventFilter.ALL);

  const router = useRouter();
  const query = useSearchParams();
  const season = query.get('season') ?? 'latest';
  const regionFilter = query.get('region') ?? 'all';

  const { data: seasonData } = useSWR<Season | null>(`/portal/seasons/${season}`, {
    suspense: true,
    fallbackData: null
  });

  const { data: seasonEvents = [] } = useSWR<EventSummary[]>(
    () => (seasonData ? `/portal/events?season=${seasonData.slug}` : null),
    { suspense: true, fallbackData: [] }
  );

  const availableRegions = useMemo(
    () => Array.from(new Set(seasonEvents.map(event => event.region))).sort(),
    [seasonEvents]
  );

  const filteredByRegion = useMemo(
    () =>
      regionFilter === 'all'
        ? seasonEvents
        : seasonEvents.filter(event => event.region === regionFilter),
    [seasonEvents, regionFilter]
  );

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams(query.toString());
    if (newRegion === 'all') {
      params.delete('region');
    } else {
      params.set('region', newRegion);
    }
    router.push(`?${params.toString()}`);
  };

  // This should never happen due to the suspense option
  if (!seasonData) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <EventsPageHeader
          currentSeason={seasonData}
          regionFilter={regionFilter}
          availableRegions={availableRegions}
          onRegionChange={handleRegionChange}
        />

        <EventsSearchSection
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          events={filteredByRegion}
        />

        <EventsListSection
          events={filteredByRegion}
          searchValue={searchValue}
          filterTab={filterTab}
        />
      </Container>
    </Box>
  );
}
