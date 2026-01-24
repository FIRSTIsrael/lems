'use client';

import { useQuery } from '@apollo/client/react';
import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Event } from '@lems/types/api/lems';
import { EventCard } from '../components/homepage/event-card';
import { GET_EVENTS_QUERY, HomepageEvent } from '../components/homepage/graphql';

export default function BrowseEventsPage() {
  const router = useRouter();
  const t = useTranslations('browse-events');

  const { data, loading, error } = useQuery(GET_EVENTS_QUERY, {
    variables: {
      fullySetUp: true
    }
  });

  const allEvents: Event[] =
    data?.events.map((event: HomepageEvent) => ({
      id: event.id,
      name: event.name,
      slug: event.slug,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      location: '', // Not fetched
      region: event.region,
      coordinates: null,
      seasonId: '' // Placeholder - not available from current query
    })) || [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} variant="text">
            {t('back')}
          </Button>
        </Stack>

        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h3"
            fontWeight="700"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}
          >
            {t('title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '1rem', md: '1.125rem' },
              maxWidth: '600px'
            }}
          >
            {t('description')}
          </Typography>
        </Box>

        {/* Events Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="text.secondary">{t('loading')}</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography color="error">{t('no-events')}</Typography>
          </Box>
        ) : allEvents.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <CalendarIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 3 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {t('no-events')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {t('no-events-description')}
            </Typography>
            <Button variant="contained" onClick={() => router.push('/')}>
              {t('go-home')}
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {allEvents.map(event => (
              <EventCard key={event.id} event={event} variant="upcoming" />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
