'use client';

import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Box, Button, Grid, Typography, CircularProgress } from '@mui/material';
import { Add } from '@mui/icons-material';
import { Season, EventSummary } from '@lems/types/api/admin';
import { EventCard } from './event-card';

interface EventGridProps {
  season: Season;
  disableCreation?: boolean;
  shouldFetch?: boolean;
}

export const EventGrid: React.FC<EventGridProps> = ({
  season,
  disableCreation = false,
  shouldFetch = true
}) => {
  const t = useTranslations('pages.events.grid');

  const { data: events = [], isLoading } = useSWR<EventSummary[]>(
    shouldFetch ? `/admin/events/season/${season.id}/summary` : null
  );

  console.log(events);

  if (isLoading) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: 'text.secondary'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {events.map(event => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
            <EventCard {...event} onDelete={() => {}} onCopy={() => {}} />
          </Grid>
        ))}
      </Grid>

      {events.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('empty-state.no-events')}
          </Typography>
          {!disableCreation && (
            <>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {t('empty-state.no-events-description')}
              </Typography>
              <Button variant="contained" startIcon={<Add />} href="/events/create">
                {t('empty-state.create-new-event')}
              </Button>
            </>
          )}
        </Box>
      )}
    </>
  );
};
