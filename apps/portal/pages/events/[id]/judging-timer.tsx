import { Container } from '@mui/material';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { JudgingTimer } from '../../../components/judging/timer';
import { fetchEvent } from '../../../lib/data/events';
import { Event } from '@lems/types';

interface JudgingTimerPageProps {
  event: Event;
}

const JudgingTimerPage = ({ event }: JudgingTimerPageProps) => {
  return (
    <Container maxWidth="md">
      <JudgingTimer />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event } = await fetchEvent(eventId);
  return { props: { event } };
};

export default JudgingTimerPage;
