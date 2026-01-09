'use client';

import { Stack } from '@mui/material';
import { AgendaEvent } from '../graphql';
import { AgendaEventCard } from './agenda-event-card';

interface AgendaEventsListProps {
  events: AgendaEvent[];
}

export function AgendaEventsList({ events }: AgendaEventsListProps) {
  return (
    <Stack spacing={2}>
      {events.map(event => (
        <AgendaEventCard key={event.id} event={event} />
      ))}
    </Stack>
  );
}
