import { NextPage, GetStaticProps, GetStaticPropsContext, GetStaticPaths } from 'next';
import { Box, Container, Stack, Typography } from '@mui/material';
import { PortalEvent, PortalTeam, PortalEventStatus } from '@lems/types';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import EventInfo from '../../../components/events/event-info';
import EventQuickLinks from '../../../components/events/event-quick-links';
import TeamList from '../../../components/teams/team-list';
import EventStatus from '../../../components/events/event-status';
import PageError from '../../../components/page-error';
import { useRealtimeData } from '../../../hooks/use-realtime-data';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
  hasAwards: boolean;
}

const Page: NextPage<Props> = ({ event, teams, hasAwards }) => {
  if (!event) return <PageError statusCode={404} />

  const {
    data: status,
    isLoading,
    error
  } = useRealtimeData<PortalEventStatus>(`/events/${event.id}/status`);

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      {event.isDivision && (
        <Stack direction="row" spacing={2} alignItems="center">
          <Box bgcolor={event.color} width={18} height={18} borderRadius={1} />
          <Typography variant="body1" color="text.secondary">
            {event.subtitle}
          </Typography>
        </Stack>
      )}
      <EventInfo event={event} teamCount={teams.length} />
      {!isLoading && !error && status.isLive && <EventStatus event={event} status={status} />}
      <EventQuickLinks event={event} hasAwards={hasAwards} />
      <Typography variant="h2" gutterBottom>
        קבוצות באירוע
      </Typography>
      <TeamList eventId={event.id} teams={teams} />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }: GetStaticPropsContext) => {
  const eventId = params?.id as string;
  const { event, teams } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  return {
    props: { event, teams, hasAwards: !!awards },
    revalidate: 10 * 60 // 10 mintues
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  // We don't know the events at build time, Next.js will generate the pages at runtime.
  return { paths: [], fallback: true };
}

export default Page;
