import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { Container, Typography } from '@mui/material';
import { fetchTeam } from '../../../../lib/api';
import { PortalAward, PortalTeam } from '@lems/types';

interface Props {
  team: PortalTeam;
  awards: PortalAward[] | null;
}

const Page: NextPage<Props> = ({ team, awards }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h2">Team Info</Typography>
      <Typography>{team.name}</Typography>
      <Typography variant="h2">Team scores</Typography>
      <Typography variant="h2">Awards if completed</Typography>
      {awards !== null &&
        awards.map(award => <Typography key={award.name}>{award.name}</Typography>)}
      <Typography variant="h2">Schedule</Typography>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const teamNumber = ctx.params?.number as string;

  const { team, awards } = await fetchTeam(eventId, teamNumber);
  return { props: { team, awards } };
};

export default Page;
