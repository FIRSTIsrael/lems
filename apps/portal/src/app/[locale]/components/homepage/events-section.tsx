'use client';

import React from 'react';
import { Box, Typography, Chip, Stack, IconButton, Collapse } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { Event, EventCard } from './event-card';

interface EventsSectionProps {
  title: string;
  events: Event[];
  variant: 'active' | 'upcoming' | 'past';
  chipColor?: 'success' | 'primary' | 'secondary';
  emptyMessage?: string;
  maxDisplayed?: number;
  defaultExpanded?: boolean;
  showIcon?: React.ReactNode;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  title,
  events,
  variant,
  chipColor = 'primary',
  emptyMessage,
  maxDisplayed,
  defaultExpanded = true,
  showIcon
}) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const displayedEvents = maxDisplayed ? events.slice(0, maxDisplayed) : events;
  const hasMoreEvents = maxDisplayed && events.length > maxDisplayed;

  if (events.length === 0) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mt: variant === 'active' ? 0 : 4, mb: 2, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        {showIcon}
        <Typography
          variant={variant === 'active' ? 'h5' : 'h6'}
          fontWeight="bold"
          sx={{
            fontSize: variant === 'active' ? { xs: '1.25rem', sm: '1.5rem' } : undefined,
            flex: 1
          }}
        >
          {title}
        </Typography>
        <Chip label={events.length} color={chipColor} size="small" sx={{ fontWeight: 600 }} />
        <IconButton size="small">{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Stack>

      <Collapse in={expanded}>
        {events.length === 0 && emptyMessage ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'text.secondary'
            }}
          >
            <CalendarIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              {emptyMessage}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {displayedEvents.map(event => (
              <EventCard key={event.id} event={event} variant={variant} />
            ))}
          </Stack>
        )}

        {hasMoreEvents && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
            And {events.length - maxDisplayed!} more {variant} events...
          </Typography>
        )}
      </Collapse>
    </>
  );
};
