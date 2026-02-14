'use client';

import { Grid } from '@mui/material';
import {
  EmojiEvents,
  Schedule,
  Groups,
  Domain,
  IntegrationInstructions,
  Settings,
  ManageAccounts,
  AccountTree,
  Map
} from '@mui/icons-material';
import { useEvent } from '../../components/event-context';
import EditEventCard from './edit-event-card';

export const EditEventGrid: React.FC = () => {
  const event = useEvent();
  const cardSize = { xs: 12, md: 6, lg: 3 };

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<AccountTree />}
          title="divisions"
          href={`/events/${event.slug}/divisions`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard icon={<Groups />} title="teams" href={`/events/${event.slug}/teams`} />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard icon={<Domain />} title="venue" href={`/events/${event.slug}/venue`} />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard icon={<Map />} title="pit-map" href={`/events/${event.slug}/pit-map`} />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<Schedule />}
          title="schedule"
          href={`/events/${event.slug}/schedule`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<EmojiEvents />}
          title="awards"
          href={`/events/${event.slug}/awards`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<IntegrationInstructions />}
          title="integrations"
          href={`/events/${event.slug}/integrations`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<ManageAccounts />}
          title="users"
          href={`/events/${event.slug}/users`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<Settings />}
          title="settings"
          href={`/events/${event.slug}/settings`}
        />
      </Grid>
    </Grid>
  );
};
