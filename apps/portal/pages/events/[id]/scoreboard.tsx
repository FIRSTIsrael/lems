import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography } from '@mui/material';
import { fetchScoreboard } from '../../../lib/api';
import { PortalScore } from '@lems/types';

interface Props {
  scoreboard: PortalScore[];
}

const Page: NextPage<Props> = ({ scoreboard }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      {scoreboard.map(entry => (
        <Typography key={entry.team.name}>
          {entry.team.name}: {entry.maxScore}
        </Typography>
      ))}
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const scoreboard = await fetchScoreboard(eventId);
  return { props: { scoreboard } };
};

export default Page;
