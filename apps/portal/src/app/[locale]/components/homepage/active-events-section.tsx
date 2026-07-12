'use client';

import useSWR from 'swr';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Box, Paper, Button } from '@mui/material';
import { Event as EventIcon, ArrowForward, ArrowBack } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { EventSummary, PortalEventSummariesResponseSchema } from '@lems/types/api/portal';
import { EventsSection } from './events-section';

export const ActiveEventsSection = () => {
  const t = useTranslations('pages.index.events');

  const threeDaysAgo = dayjs().subtract(3, 'days');

  const { data: events = [] } = useSWR<EventSummary[]>(
    [`/portal/events?after=${threeDaysAgo.unix()}`, PortalEventSummariesResponseSchema],
    { suspense: true, fallbackData: [] }
  );

  const { activeEvents, upcomingEvents, pastEvents } = events.reduce(
    (acc, event) => {
      acc[`${event.status}Events`].push(event);
      return acc;
    },
    { activeEvents: [], upcomingEvents: [], pastEvents: [] } as Record<string, EventSummary[]>
  );

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
        maxDisplayed={5}
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
        <Button
          variant="outlined"
          size="large"
          href="/events"
          endIcon={<DirectionalIcon ltr={ArrowForward} rtl={ArrowBack} />}
        >
          {t('view-all-events')}
        </Button>
      </Box>
    </Paper>
  );
};
