import { useMemo } from 'react';
import dayjs from 'dayjs';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { Container, Typography, Stack } from '@mui/material';
import { PortalEvent } from '@lems/types';
import { fetchEvents } from '../../lib/api';
import EventTable from '../../components/events/event-table';

interface Props {
  events: PortalEvent[];
}

const Page: NextPage<Props> = ({ events }) => {
  const router = useRouter();

  const { current, past, future } = useMemo(() => {
    const today = dayjs().startOf('day');
    return events.reduce(
      (acc, event) => {
        const eventDate = dayjs(event.date).startOf('day');
        if (eventDate === today) {
          acc.current.push(event);
        } else if (eventDate < today) {
          acc.past.push(event);
        } else {
          acc.future.push(event);
        }
        return acc;
      },
      { current: [], past: [], future: [] } as Record<'current' | 'past' | 'future', PortalEvent[]>
    );
  }, [events]);

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h1" gutterBottom>
        אירועים
      </Typography>
      <Stack spacing={4}>
        {<EventTable title="אירועים פעילים" events={current} />}
        {<EventTable title="אירועים עתידיים" events={future} />}
        {<EventTable title="אירועים קודמים" events={past} />}
      </Stack>
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const events = await fetchEvents();
  return { props: { events } };
};

export default Page;
