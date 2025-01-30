import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { PortalEvent, PortalTeam } from '@lems/types';
import { fetchAwards, fetchEvent, fetchEventStatus } from '../../../lib/api';
import LiveIcon from '../../../components/live-icon';
import EventInfo from '../../../components/events/event-info';
import EventQuickLinks from '../../../components/events/event-quick-links';
import TeamList from '../../../components/teams/team-list';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  isLive: boolean;
  hasAwards: boolean;
}

const Page: NextPage<Props> = ({ event, teams, isLive, hasAwards }) => {
  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {event.isDivision && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
          <Typography variant="h6" color="text.secondary">
            {event.subtitle}
          </Typography>
        </Stack>
      )}
      {isLive && (
        <Paper sx={{ p: 2, my: 2, width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h2" maxWidth="90%">
              אירוע פעיל
            </Typography>
            <LiveIcon />
          </Stack>
          {/* TODO */}
          <Typography variant="h2">Event status info</Typography>
        </Paper>
      )}
      <EventInfo event={event} teamCount={teams.length} />
      <EventQuickLinks event={event} hasAwards={hasAwards} />
      <Typography variant="h2" gutterBottom>
        קבוצות באירוע
      </Typography>
      <TeamList eventId={event.id} teams={teams} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { isLive } = await fetchEventStatus(eventId);
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  return { props: { event, teams, hasAwards: !!awards, isLive } };
};

export default Page;
