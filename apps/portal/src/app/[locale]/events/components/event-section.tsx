'use client';

import { useTranslations } from 'next-intl';
import { Paper, Typography, Stack } from '@mui/material';
import { EventSummary } from '@lems/types/api/portal';
import { EventListItem } from './event-list-item';

interface EventSectionProps {
  events: EventSummary[];
  variant: 'active' | 'upcoming' | 'past';
}

export const EventSection: React.FC<EventSectionProps> = ({ events, variant }) => {
  const t = useTranslations('pages.events');

  const filteredEvents = events.filter(event => event.status === variant);
  if (filteredEvents.length === 0) return null;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}
      >
        {t(`filters.${variant}`, { count: filteredEvents.length })}
      </Typography>
      <Stack spacing={1}>
        {filteredEvents.map(event => (
          <EventListItem key={event.id} event={event} variant={variant} />
        ))}
      </Stack>
    </Paper>
  );
};
