import { getTranslations } from 'next-intl/server';
import { Grid, Stack, Typography } from '@mui/material';
import CurrentSeasonWidget from './components/widgets/current-season';
import RegisteredTeamsWidget from './components/widgets/registered-teams';
import UpcomingEventsWidget from './components/widgets/upcoming-events/upcoming-events';
import TotalEventsWidget from './components/widgets/total-events';
import TotalAdminsWidget from './components/widgets/total-admins';
import EventParticipationWidget from './components/widgets/event-participation';
import NoPermissionsAlert from './components/no-permissions-alert';

export default async function HomePage() {
  const t = await getTranslations('pages.index');

  return (
    <>
      <Typography variant="h1">{t('title')}</Typography>
      <Stack spacing={2} sx={{ mt: 3 }}>
        <NoPermissionsAlert />
        <Grid container columns={{ xs: 4, sm: 8, md: 12, lg: 12, xl: 16 }} spacing={3}>
          <Grid size={{ xs: 4, sm: 8, md: 6, lg: 6, xl: 8 }}>
            <CurrentSeasonWidget />
          </Grid>
          <Grid size={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 4 }}>
            <RegisteredTeamsWidget />
          </Grid>
          <Grid size={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 4 }}>
            <TotalEventsWidget />
          </Grid>
          <Grid size={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 4 }}>
            <TotalAdminsWidget />
          </Grid>
          <Grid size={{ xs: 4, sm: 4, md: 3, lg: 3, xl: 4 }}>
            <EventParticipationWidget />
          </Grid>
          <Grid size={{ xs: 4, sm: 8, md: 6, lg: 6, xl: 8 }}>
            <UpcomingEventsWidget />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
}
