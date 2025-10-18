'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { fetchUpcomingEvents, HomepageEventsResponseData } from './events.graphql';

export const UpcomingEventsSection: React.FC = () => {
  const { endOfDay, endOfWeek } = useMemo(() => {
    const currentTime = dayjs();
    return {
      endOfDay: currentTime.endOf('day').toISOString(),
      endOfWeek: currentTime.endOf('week').toISOString()
    };
  }, []);

  const { data, isLoading } = useSWR<HomepageEventsResponseData>(
    ['upcoming-events', endOfDay, endOfWeek],
    () => fetchUpcomingEvents(endOfDay, endOfWeek)
  );

  const upcomingEvents: Event[] =
    data?.events.map(event => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: '',
      coordinates: null,
      seasonId: ''
    })) || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No upcoming events this week
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <CalendarIcon
          sx={{
            color: 'primary.main',
            fontSize: 20
          }}
        />
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Upcoming Events
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
        Events happening through the end of this week
      </Typography>

      <Stack spacing={3}>
        {upcomingEvents.map(event => (
          <EventCard key={event.id} event={event} variant="upcoming" />
        ))}
      </Stack>
    </Box>
  );
};
