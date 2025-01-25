import { NextPage, GetServerSideProps } from 'next';
import { Container, Typography } from '@mui/material';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../../lib/api';

interface Props {
  events: PortalEvent[];
}

const Page: NextPage<Props> = ({ events }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography>List of events, grouped by now future and past.</Typography>
      <Typography variant="h4">אירועים</Typography>
      {events.map(event => (
        <Typography key={event.id}>{event.name}</Typography>
      ))}
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await fetchEvents();
  return { props: { events } };
};

export default Page;
