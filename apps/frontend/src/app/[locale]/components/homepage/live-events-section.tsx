'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Typography, Stack, Button } from '@mui/material';
import { FiberManualRecord as LiveIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { GET_EVENTS_QUERY, HomepageEvent } from './graphql';

export const LiveEventsSection: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('homepage');

  const { startOfDay, endOfDay } = useMemo(() => {
    const currentTime = dayjs();
    return {
      startOfDay: currentTime.startOf('day').subtract(1, 'minute').toISOString(),
      endOfDay: currentTime.endOf('day').add(1, 'minute').toISOString()
    };
  }, []);

  const { data, loading } = useQuery(GET_EVENTS_QUERY, {
    variables: {
      fullySetUp: true,
      startAfter: startOfDay,
      endBefore: endOfDay
    }
  });

  const liveEvents: Event[] =
    data?.events.map((event: HomepageEvent) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: '', // Not fetched anymore
      region: event.region,
      coordinates: null,
      official: event.official,
      seasonId: '' // Placeholder - not available from current query
    })) || [];

  if (loading) {
    return null; // TODO: Actual loading state
  }

  if (liveEvents.length === 0) {
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
            {t('live-events-title')}
          </Typography>
        </Stack>

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('no-live-events')}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/events')} sx={{ mt: 3 }}>
            {t('view-all')}
          </Button>
        </Box>
      </Box>
    );
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
          {t('live-events-title')}
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
        {t('live-events-subtitle')}
      </Typography>

      <Stack spacing={3}>
        {liveEvents.map(event => (
          <EventCard key={event.id} event={event} variant="live" />
        ))}
      </Stack>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="outlined" onClick={() => router.push('/events')}>
          {t('view-all')}
        </Button>
      </Box>
    </Box>
  );
};
