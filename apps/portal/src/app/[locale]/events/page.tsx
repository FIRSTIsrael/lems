'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import EventsPageHeader from '../components/events/EventsPageHeader';
import EventsSearchSection from '../components/events/EventsSearchSection';
import EventsListSection from '../components/events/EventsListSection';
import { mockEvents, getEventCounts } from '../components/events/mockEvents';

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

        <EventsListSection
          events={mockEvents}
          searchValue={searchValue}
          filterTab={filterTab}
        />
      </Container>
    </Box>
  );
}
