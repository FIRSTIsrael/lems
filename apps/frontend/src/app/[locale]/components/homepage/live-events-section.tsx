'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { FiberManualRecord as LiveIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { fetchLiveEvents, HomepageEventsResponseData } from './events.graphql';

export const LiveEventsSection: React.FC = () => {
  const { now, oneDayAgo } = useMemo(() => {
    const currentTime = dayjs();
    return {
      now: currentTime.toISOString(),
      oneDayAgo: currentTime.subtract(1, 'day').toISOString()
    };
  }, []);

  const { data, isLoading } = useSWR<HomepageEventsResponseData>(
    ['live-events', now, oneDayAgo],
    () => fetchLiveEvents(now, oneDayAgo)
  );

  const liveEvents: Event[] =
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
