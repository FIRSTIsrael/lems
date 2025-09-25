'use client';

import { useTranslations } from 'next-intl';
import { Box, Paper, Button } from '@mui/material';
import { Event as EventIcon, ArrowForward as ArrowIcon } from '@mui/icons-material';
import { EventsSection } from './events-section';
import { mockEvents } from './dummy-data';

export const ActiveEventsSection = () => {
  const t = useTranslations('pages.index.events');

  const events = mockEvents;

  const activeEvents = events.filter(event => event.isActive);
  const upcomingEvents = events.filter(event => event.isUpcoming);
  const pastEvents = events.filter(event => event.isPast);

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 } }}>
      <EventsSection
        title={t('active-events')}
        events={activeEvents}
        variant="active"
        chipColor="error"
        emptyMessage={t('no-active-events')}
        defaultExpanded={true}
        showIcon={<EventIcon color="primary" />}
      />

      <EventsSection
        title={t('upcoming-events')}
        events={upcomingEvents}
        variant="upcoming"
        chipColor="primary"
        defaultExpanded={true}
      />

      <EventsSection
        title={t('past-events')}
        events={pastEvents}
        variant="past"
        chipColor="secondary"
        maxDisplayed={3}
        defaultExpanded={false}
      />

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="outlined" size="large" href="/events" endIcon={<ArrowIcon />}>
          {t('view-all-events')}
        </Button>
      </Box>
    </Paper>
  );
};
