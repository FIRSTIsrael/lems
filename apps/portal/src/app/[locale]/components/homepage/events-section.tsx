'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Typography, Chip, Stack, IconButton, Collapse } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { EventSummary } from '@lems/types/api/portal';
import { EventCard } from './event-card';

interface EventsSectionProps {
  title: string;
  events: EventSummary[];
  variant: 'active' | 'upcoming' | 'past';
  chipColor?: 'success' | 'primary' | 'secondary' | 'error';
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
  const t = useTranslations('pages.index.events');

  const [expanded, setExpanded] = React.useState(defaultExpanded);

  const sortedEvents = React.useMemo(() => {
    return [...events].sort((a, b) => {
      if (variant === 'past') {
        return b.startDate.getTime() - a.startDate.getTime();
      } else {
        return a.startDate.getTime() - b.startDate.getTime();
      }
    });
  }, [events, variant]);

  const displayedEvents = maxDisplayed ? sortedEvents.slice(0, maxDisplayed) : sortedEvents;
  const hasMoreEvents = maxDisplayed && events.length > maxDisplayed;

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
        {events.length === 0 ? (
          <Box textAlign="center" py={6} color="text.secondary">
            <CalendarIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" gutterBottom>
              {emptyMessage || t('no-events')}
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
            {t('more-events', { count: events.length - maxDisplayed!, variant })}
          </Typography>
        )}
      </Collapse>
    </>
  );
};
