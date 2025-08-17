'use client';

import { Event } from '@lems/types/api/admin';
import { Grid } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GroupIcon from '@mui/icons-material/Group';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import SettingsIcon from '@mui/icons-material/Settings';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import EditEventCard from './edit-event-card';

export interface EditEeventGridProps {
  event: Event;
}

export const EditEventGrid: React.FC<EditEeventGridProps> = ({ event }) => {
  const cardSize = { xs: 12, md: 6, lg: 3 };

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid size={cardSize}>
        <EditEventCard icon={<GroupIcon />} title="teams" href={`/events/${event.slug}/teams`} />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<EmojiEventsIcon />}
          title="awards"
          href={`/events/${event.slug}/awards`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<ScheduleIcon />}
          title="schedule"
          href={`/events/${event.slug}/schedule`}
        />
      </Grid>

      <Grid size={cardSize}>
        <EditEventCard
          icon={<LocationOnIcon />}
          title="venue"
          href={`/events/${event.slug}/venue`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<IntegrationInstructionsIcon />}
          title="integrations"
          href={`/events/${event.slug}/integrations`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<SettingsIcon />}
          title="settings"
          href={`/events/${event.slug}/settings`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<ManageAccountsIcon />}
          title="users"
          href={`/events/${event.slug}/users`}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<AccountTreeIcon />}
          title="divisions"
          href={`/events/${event.slug}/divisions`}
        />
      </Grid>
    </Grid>
  );
};
