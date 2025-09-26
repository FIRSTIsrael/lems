'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import EventsPageHeader from './components/events-page-header';
import EventsSearchSection from './components/events-search-section';
import EventsListSection from './components/event-list-section';
import { mockEvents, getEventCounts } from './components/mockEvents';

export default function EventsPage() {
  const [searchValue, setSearchValue] = React.useState('');
  const [filterTab, setFilterTab] = React.useState(0);

  const eventCounts = getEventCounts(mockEvents);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <EventsPageHeader />

        <EventsSearchSection
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          filterTab={filterTab}
          onFilterChange={setFilterTab}
          eventCounts={eventCounts}
        />

        <EventsListSection events={mockEvents} searchValue={searchValue} filterTab={filterTab} />
      </Container>
    </Box>
  );
}
