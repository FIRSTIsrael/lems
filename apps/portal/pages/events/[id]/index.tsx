import { NextPage, GetServerSideProps } from 'next';
import { Container, Typography } from '@mui/material';

interface Props {}

const Page: NextPage<Props> = ({}) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography>Happening now paper if event is now</Typography>
      <Typography>Event info</Typography>
      <Typography>Quick links</Typography>
      <Typography>Team List</Typography>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Page;
