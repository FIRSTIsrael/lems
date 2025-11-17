'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);

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

  const availableRegions = useMemo(
    () => Array.from(new Set(seasonEvents.map(event => event.region))).sort(),
    [seasonEvents]
  );

  const filteredByRegion = useMemo(
    () =>
      selectedRegions.length === 0
        ? seasonEvents
        : seasonEvents.filter(event => selectedRegions.includes(event.region)),
    [seasonEvents, selectedRegions]
  );

  // This should never happen due to the suspense option
  if (!seasonData) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <EventsPageHeader
          currentSeason={seasonData}
          selectedRegions={selectedRegions}
          availableRegions={availableRegions}
          onRegionsChange={setSelectedRegions}
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
