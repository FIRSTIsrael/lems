'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import { EventFilter } from '../event-filter';
import { EventSection } from './event-section';

interface EventsListSectionProps {
  events: EventSummary[];
  searchValue: string;
  filterTab: EventFilter;
}

export const EventsListSection: React.FC<EventsListSectionProps> = ({
  events,
  searchValue,
  filterTab
}) => {
  const t = useTranslations('pages.events');

  const filterEventsBySearch = (eventList: EventSummary[]) => {
    return eventList.filter(
      event =>
        !searchValue ||
        event.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        event.location.toLowerCase().includes(searchValue.toLowerCase())
    );
  };

  const filteredEvents = filterEventsBySearch(events);
  const hasAnyEvents = filteredEvents.length > 0;

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
      </Paper>
    );
  }

  return (
    <Stack spacing={4}>
      {(filterTab === EventFilter.ALL || filterTab === EventFilter.ACTIVE) && (
        <EventSection events={filteredEvents} variant="active" />
      )}

      {(filterTab === EventFilter.ALL || filterTab === EventFilter.UPCOMING) && (
        <EventSection events={filteredEvents} variant="upcoming" />
      )}

      {(filterTab === EventFilter.ALL || filterTab === EventFilter.PAST) && (
        <EventSection events={filteredEvents} variant="past" />
      )}
    </Stack>
  );
};
