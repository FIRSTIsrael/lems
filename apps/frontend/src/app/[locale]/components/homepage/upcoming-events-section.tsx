'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Box, Typography, Stack } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { GET_EVENTS_QUERY, HomepageEvent } from './graphql';

export const UpcomingEventsSection: React.FC = () => {
  const { endOfDay, endOfWeek } = useMemo(() => {
    const currentTime = dayjs();
    return {
      endOfDay: currentTime.endOf('day').toISOString(),
      endOfWeek: currentTime.endOf('week').toISOString()
    };
  }, []);

  const { data, loading } = useQuery(GET_EVENTS_QUERY, {
    variables: {
      fullySetUp: true,
      startAfter: endOfDay,
      endBefore: endOfWeek
    }
  });

  const upcomingEvents: Event[] =
    data?.events.map((event: HomepageEvent) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      coordinates: null,
      location: event.location,
      region: event.region,
      seasonId: event.seasonId
    })) || [];

  if (loading) {
    return null; // TODO: Actual loading state
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
