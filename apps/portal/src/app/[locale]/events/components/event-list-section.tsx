'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Typography, Stack, Button } from '@mui/material';
import { CalendarToday as CalendarIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import EventListItem from './event-list-item';

interface EventsListSectionProps {
  events: EventSummary[];
  searchValue: string;
  filterTab: number;
}

export default function EventsListSection({
  events,
  searchValue,
  filterTab
}: EventsListSectionProps) {
  const t = useTranslations('pages.events');

  const activeEvents = events.filter(event => event.status === 'active');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');
  const pastEvents = events.filter(event => event.status === 'past');

  const filterEventsBySearch = (eventList: EventSummary[]) => {
    return eventList.filter(
      event =>
        !searchValue ||
        event.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.location.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const filteredActiveEvents = filterEventsBySearch(activeEvents);
  const filteredUpcomingEvents = filterEventsBySearch(upcomingEvents);
  const filteredPastEvents = filterEventsBySearch(pastEvents);

  const hasAnyEvents =
    filteredActiveEvents.length > 0 ||
    filteredUpcomingEvents.length > 0 ||
    filteredPastEvents.length > 0;

  if (!hasAnyEvents) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <CalendarIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {t('no-events.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {searchValue ? t('no-events.search-message') : t('no-events.filter-message')}
        </Typography>
        {searchValue && (
          <Button
            variant="outlined"
            onClick={() => {
              /* This would need to be passed as prop */
            }}
            startIcon={<CalendarIcon />}
          >
            {t('no-events.clear-search')}
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Active Events Section */}
      {(filterTab === 0 || filterTab === 1) && filteredActiveEvents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {t('filters.active', { count: filteredActiveEvents.length })}
          </Typography>
          <Stack spacing={1}>
            {filteredActiveEvents.map(event => (
              <EventListItem key={event.id} event={event} variant="active" />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Upcoming Events Section */}
      {(filterTab === 0 || filterTab === 2) && filteredUpcomingEvents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {t('filters.upcoming', { count: filteredUpcomingEvents.length })}
          </Typography>
          <Stack spacing={1}>
            {filteredUpcomingEvents.map(event => (
              <EventListItem key={event.id} event={event} variant="upcoming" />
            ))}
          </Stack>
        </Paper>
      )}

      {/* Past Events Section */}
      {(filterTab === 0 || filterTab === 3) && filteredPastEvents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            {t('filters.past', { count: filteredPastEvents.length })}
          </Typography>
          <Stack spacing={1}>
            {filteredPastEvents.slice(0, 6).map(event => (
              <EventListItem key={event.id} event={event} variant="past" />
            ))}
          </Stack>
          {filteredPastEvents.length > 6 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" endIcon={<ArrowIcon />}>
                {t('load-more')}
              </Button>
            </Box>
          )}
        </Paper>
      )}
    </Stack>
  );
}
