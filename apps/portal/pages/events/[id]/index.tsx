import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { PortalAward, PortalEvent, PortalTeam } from '@lems/types';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import LiveIcon from '../../../components/live-icon';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  awards: PortalAward[];
}

const Page: NextPage<Props> = ({ event, teams, awards }) => {
  const router = useRouter();
  const isLive = dayjs(event.date).isSame(dayjs(), 'day');

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {isLive && (
        <Paper sx={{ p: 2, my: 2, width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h2" maxWidth="90%">
              אירוע פעיל
            </Typography>
            <LiveIcon />
          </Stack>
          <Typography variant="h2">Event status info</Typography>
        </Paper>
      )}
      <Grid container component={Paper} sx={{ p: 2, my: 2, width: '100%' }}>
        <Grid size={12}>
          <Typography variant="h2" gutterBottom>
            מידע כללי
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body1">📅 {dayjs(event.date).format('DD/MM/YYYY')}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body1">📍 {event.location}</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body1">👥 {teams.length} קבוצות</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Box
              component="span"
              bgcolor={event.color}
              width="1rem"
              height="1rem"
              borderRadius={1}
            />
            <Typography variant="body1">בית כלשהו</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Grid
        container
        component={Paper}
        columnSpacing={2}
        rowSpacing={2}
        sx={{ p: 2, my: 2, width: '100%' }}
      >
        <Grid size={{ xs: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            sx={{ borderRadius: 2, minHeight: 25 }}
            onClick={() => router.push(`/events/${event.id}/scoreboard`)}
          >
            לוח תוצאות
          </Button>
        </Grid>
        {awards.length > 0 && (
          <Grid size={{ xs: 6, md: 3 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ borderRadius: 2, minHeight: 25 }}
              onClick={() => router.push(`/events/${event.id}/scoreboard`)}
            >
              לוח תוצאות
            </Button>
          </Grid>
        )}
        <Grid size={{ xs: 6, md: 3 }}>
          <Typography variant="body1">👥 {teams.length} קבוצות</Typography>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Stack spacing={1} direction="row" alignItems="center">
            <Box
              component="span"
              bgcolor={event.color}
              width="1rem"
              height="1rem"
              borderRadius={1}
            />
            <Typography variant="body1">בית כלשהו</Typography>
          </Stack>
        </Grid>
      </Grid>
      <Typography variant="h2">Team List</Typography>
      {teams.map(team => (
        <Typography key={team.id}>{team.name}</Typography>
      ))}
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  return { props: { event, teams, awards } };
};

export default Page;
