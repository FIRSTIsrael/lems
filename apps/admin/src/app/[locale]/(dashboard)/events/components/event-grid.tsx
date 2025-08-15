'use client';

import { useTranslations } from 'next-intl';
import { Box, Button, Grid, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { EventCard } from './event-card';

interface EventGridProps {
  events: {
    id: string;
    name: string;
    date: string;
    location: string;
    teamCount: number;
    divisions: { id: string; name: string; color: string }[];
    isFullySetUp: boolean;
  }[];
  disableCreation?: boolean;
}

export const EventGrid: React.FC<EventGridProps> = ({ events, disableCreation }) => {
  const t = useTranslations('pages.events.grid');

  return (
    <>
      {/* Events Grid */}
      <Grid container spacing={3}>
        {events.map(event => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={event.id}>
            <EventCard {...event} onEdit={() => {}} onDelete={() => {}} onCopy={() => {}} />
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
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
