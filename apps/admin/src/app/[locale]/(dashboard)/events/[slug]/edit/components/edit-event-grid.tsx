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

export const EditEventGrid: React.FC<EditEeventGridProps> = () => {
  const cardSize = { xs: 12, md: 6, lg: 3 };

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<EmojiEventsIcon />}
          title="awards"
          onClick={() => {
            // TODO: Navigate to awards page
            console.log('Navigate to awards');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<ScheduleIcon />}
          title="schedule"
          onClick={() => {
            // TODO: Navigate to schedule page
            console.log('Navigate to schedule');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<GroupIcon />}
          title="teams"
          onClick={() => {
            // TODO: Navigate to teams page
            console.log('Navigate to teams');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<LocationOnIcon />}
          title="venue"
          onClick={() => {
            // TODO: Navigate to venue page
            console.log('Navigate to venue');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<IntegrationInstructionsIcon />}
          title="integrations"
          onClick={() => {
            // TODO: Navigate to integrations page
            console.log('Navigate to integrations');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<SettingsIcon />}
          title="settings"
          onClick={() => {
            // TODO: Navigate to settings page
            console.log('Navigate to settings');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<ManageAccountsIcon />}
          title="users"
          onClick={() => {
            // TODO: Navigate to users page
            console.log('Navigate to users');
          }}
        />
      </Grid>
      <Grid size={cardSize}>
        <EditEventCard
          icon={<AccountTreeIcon />}
          title="divisions"
          onClick={() => {
            // TODO: Navigate to divisions page
            console.log('Navigate to divisions');
          }}
        />
      </Grid>
    </Grid>
  );
};
