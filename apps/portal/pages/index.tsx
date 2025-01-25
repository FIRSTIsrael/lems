import { NextPage, GetServerSideProps } from 'next';
import { Container, Typography } from '@mui/material';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../lib/api';

interface Props {
  events: PortalEvent[];
}

const Page: NextPage<Props> = ({ events }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography>SUBMERGED header with cool image</Typography>
      <Typography>Happening now paper</Typography>
      <Typography>See all events</Typography>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await fetchEvents();
  return { props: { events } };
};

export default Page;
