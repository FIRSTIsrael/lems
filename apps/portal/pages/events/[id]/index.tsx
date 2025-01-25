import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography } from '@mui/material';
import { fetchEvent } from '../../../lib/api';
import { PortalEvent, PortalTeam } from '@lems/types';

interface Props {
  event: PortalEvent;
  teams: PortalTeam[];
}

const Page: NextPage<Props> = ({ event, teams }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h1">{event.name}</Typography>
      <Typography>Happening now paper if event is now</Typography>
      <Typography variant="h2">Event info</Typography>
      <Typography variant="h2">Quick links</Typography>
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
  return { props: { event, teams } };
};

export default Page;
