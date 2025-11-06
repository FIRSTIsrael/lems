'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Box, Typography, Stack } from '@mui/material';
import { FiberManualRecord as LiveIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { GET_EVENTS_QUERY, HomepageEvent } from './events.graphql';

export const LiveEventsSection: React.FC = () => {
  const { now, oneDayAgo } = useMemo(() => {
    const currentTime = dayjs();
    return {
      now: currentTime.toISOString(),
      oneDayAgo: currentTime.subtract(1, 'day').toISOString()
    };
  }, []);

  const { data, loading } = useQuery(GET_EVENTS_QUERY, {
    variables: {
      fullySetUp: true,
      startAfter: oneDayAgo,
      startBefore: now,
      endAfter: now
    }
  });

  const liveEvents: Event[] =
    data?.events.map((event: HomepageEvent) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: '',
      coordinates: null,
      seasonId: ''
    })) || [];

  if (loading) {
    return null; // TODO: Actual loading state
  }

  if (liveEvents.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <LiveIcon
          sx={{
            color: 'error.main',
            fontSize: 20,
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 }
            }
          }}
        />
        <Typography
          variant="h4"
          fontWeight="700"
          sx={{
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Live Events
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
        Events happening right now
      </Typography>

      <Stack spacing={3}>
        {liveEvents.map(event => (
          <EventCard key={event.id} event={event} variant="live" />
        ))}
      </Stack>
    </Box>
  );
};
