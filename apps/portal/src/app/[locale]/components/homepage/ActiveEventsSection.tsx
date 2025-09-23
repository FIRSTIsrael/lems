'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Button } from '@mui/material';
import { Event as EventIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import EventsSection from './EventsSection';
import { Event } from './EventCard';

interface ActiveEventsSectionProps {
  events: Event[];
}

export default function ActiveEventsSection({ events }: ActiveEventsSectionProps) {
  const tEvents = useTranslations('pages.index.events');

  const activeEvents = events.filter(event => event.isActive);
  const upcomingEvents = events.filter(event => event.isUpcoming);
  const pastEvents = events.filter(event => event.isPast);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
      {/* Active Events */}
      <EventsSection
        title={tEvents('active-events')}
        events={activeEvents}
        variant="active"
        chipColor="success"
        emptyMessage={tEvents('no-active-events')}
        defaultExpanded={true}
        showIcon={<EventIcon color="primary" />}
      />

      {/* Upcoming Events */}
      <EventsSection
        title={tEvents('upcoming-events')}
        events={upcomingEvents}
        variant="upcoming"
        chipColor="primary"
        defaultExpanded={true}
      />

      {/* Past Events */}
      <EventsSection
        title={tEvents('past-events')}
        events={pastEvents}
        variant="past"
        chipColor="secondary"
        maxDisplayed={3}
        defaultExpanded={false}
      />

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" size="large" href="/events" endIcon={<ArrowIcon />}>
          {tEvents('view-all-events')}
        </Button>
      </Box>
    </Paper>
  );
}
