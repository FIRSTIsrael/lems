'use client';

import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Box, Typography, Stack, Button } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Event } from '@lems/types/api/lems';
import { EventCard } from './event-card';
import { GET_EVENTS_QUERY, HomepageEvent } from './graphql';

export const UpcomingEventsSection: React.FC = () => {
  const router = useRouter();
  const t = useTranslations('homepage');

  const { endOfDay } = useMemo(() => {
    const currentTime = dayjs();
    return {
      endOfDay: currentTime.endOf('day').toISOString()
    };
  }, []);

  const { data, loading } = useQuery(GET_EVENTS_QUERY, {
    variables: {
      fullySetUp: true,
      startAfter: endOfDay
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
      location: '', // Not fetched anymore
      region: event.region,
      official: event.official,
      seasonId: '' // Placeholder - not available from current query
    })) || [];

  if (loading) {
    return null; // TODO: Actual loading state
  }

  if (upcomingEvents.length === 0) {
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
            {t('upcoming-events-title')}
          </Typography>
        </Stack>

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('no-upcoming-events')}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/events')} sx={{ mt: 3 }}>
            {t('view-all')}
          </Button>
        </Box>
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
          {t('upcoming-events-title')}
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.125rem' }}>
        {t('upcoming-events-subtitle')}
      </Typography>

      <Stack spacing={3}>
        {upcomingEvents.map(event => (
          <EventCard key={event.id} event={event} variant="upcoming" />
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
