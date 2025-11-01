'use client';

import useSWR from 'swr';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Box, Button, Container, Link, Paper, Typography } from '@mui/material';
import { Event as EventIcon } from '@mui/icons-material';
import { EventDetails } from '@lems/types/api/portal';
import { useTranslations } from 'next-intl';
import { DivisionSelector } from './components/division-selector';
import { EventHeader } from './components/event-header';
import { DivisionTabBar } from './components/division-tab-bar';

const EventPage = () => {
  const params = useParams();
  const t = useTranslations('pages.event.not-found');
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: eventData, error } = useSWR<EventDetails | null>(`/portal/events/${slug}`, {
    suspense: true,
    fallbackData: null
  });

  if (!eventData || !eventData.divisions || eventData.divisions.length === 0) {
    if (error) {
      return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom color="text.secondary">
                {t('title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('description')}
              </Typography>
              <Button component={Link} href="/events" variant="outlined" startIcon={<EventIcon />}>
                {t('back-to-events')}
              </Button>
            </Paper>
          </Container>
        </Box>
      );
    }
    return null;
  }

  const selectedDivisionId = searchParams.get('division') || eventData.divisions[0]?.id;
  const selectedDivision = eventData.divisions.find(division => division.id === selectedDivisionId);

  if (!selectedDivision) {
    // Should never happen but here as a failsafe
    router.replace(`/event/${slug}?division=${eventData.divisions[0]?.id}`);
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <EventHeader eventData={eventData} />

      <DivisionSelector divisions={eventData.divisions} />

      <DivisionTabBar divisionId={selectedDivision.id} />
    </Container>
  );
};

export default EventPage;
