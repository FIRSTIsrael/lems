import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper, Typography, Stack, ListItemButton, Modal } from '@mui/material';
import { WithId } from 'mongodb';
import { FllEvent, SafeUser } from '@lems/types';
import { serverSideGetRequests } from '../../lib/utils/fetch';
import Layout from '../../components/layout';
import EventSelector from '../../components/general/division-selector';

interface Props {
  user: WithId<SafeUser>;
  events: Array<WithId<FllEvent>>;
}

const Page: NextPage<Props> = ({ user, events }) => {
  const router = useRouter();

  return (
    <Layout maxWidth="sm" title="ממשק ניהול">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Stack direction="column" spacing={2}>
          <Typography variant="h2" textAlign={'center'}>
            בחירת אירוע
          </Typography>
          <EventSelector
            events={events}
            onChange={eventId => router.push(`/admin/event/${eventId}`)}
          />
          <ListItemButton
            key={'create-division'}
            dense
            sx={{ borderRadius: 2, minHeight: '50px' }}
            onClick={() => router.push('/admin/event/create')}
          >
            צור אירוע
          </ListItemButton>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests({ user: '/api/me', events: '/public/events' }, ctx);
  console.log(JSON.stringify(data.events));
  return { props: data };
};

export default Page;
