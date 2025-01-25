import { NextPage, GetServerSideProps } from 'next';
import { Container, Typography } from '@mui/material';

interface Props {}

const Page: NextPage<Props> = ({}) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography>Team Info</Typography>
      <Typography>Team scores</Typography>
      <Typography>Awards if completed</Typography>
      <Typography>Schedule</Typography>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};

export default Page;
