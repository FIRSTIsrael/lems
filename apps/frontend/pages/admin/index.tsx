import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper, Typography, Stack, ListItemButton, Modal } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, SafeUser } from '@lems/types';
import { serverSideGetRequests } from '../../lib/utils/fetch';
import Layout from '../../components/layout';
import EventSelector from '../../components/general/event-selector';
import EventCreateForm from '../../components/admin/event-create-form';

interface Props {
  user: WithId<SafeUser>;
  events: Array<WithId<Event>>;
}

const Page: NextPage<Props> = ({ user, events }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

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
            key={'create-event'}
            dense
            sx={{ borderRadius: 2, minHeight: '50px' }}
            onClick={handleOpen}
          >
            צור אירוע
          </ListItemButton>
          <Modal open={open} onClose={handleClose} aria-labelledby="create-event-model">
            <EventCreateForm />
          </Modal>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests({ user: '/api/me', events: '/public/events' }, ctx);
  return { props: data };
};

export default Page;
