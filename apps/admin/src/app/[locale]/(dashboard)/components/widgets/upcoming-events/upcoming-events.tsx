import { getTranslations } from 'next-intl/server';
import { Box, Card, CardContent, List, Typography } from '@mui/material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin/seasons';
import { AdminSummarizedEventsResponseSchema, EventSummary } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import EventListItem from './event-list-item';

export default async function UpcomingEventsWidget() {
  const t = await getTranslations('pages.index.widgets.upcoming-events');

  const seasonResult = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  let upcomingEvents: EventSummary[] = [];

  if (seasonResult.ok) {
    const eventsResult = await apiFetch(
      `/admin/events/season/${seasonResult.data.id}/summary`,
      {},
      AdminSummarizedEventsResponseSchema
    );

    if (eventsResult.ok) {
      const now = new Date();
      upcomingEvents = eventsResult.data
        .filter(event => new Date(event.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 4);
    }
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            ml: 2,
            fontWeight: 700,
            color: 'text.primary'
          }}
        >
          {t('title')}
        </Typography>

        {upcomingEvents.length === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              bgcolor: 'action.hover',
              borderRadius: 2,
              mx: 2
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {t('no-events')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {upcomingEvents.map(event => (
              <EventListItem key={event.id} event={event} />
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
