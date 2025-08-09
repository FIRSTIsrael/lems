import { getTranslations } from 'next-intl/server';
import { Card, CardContent, List, Typography } from '@mui/material';
import EventListItem from './event-list-item';

// TODO: Replace with actual event type from backend
interface Event {
  id: string;
  name: string;
  location: string;
  startDate: string;
}

export default async function UpcomingEventsWidget() {
  const t = await getTranslations('pages.index.widgets.upcoming-events');

  // TODO: Replace with actual backend call
  const events: Event[] = [
    {
      id: 'no',
      name: 'My Event',
      location: 'My Location',
      startDate: '2023-10-01T10:00:00Z'
    }
  ];

  // Show max 4 upcoming events
  const upcomingEvents = events.slice(0, 4);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom ml={2}>
          {t('title')}
        </Typography>

        {upcomingEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t('no-events')}
          </Typography>
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
