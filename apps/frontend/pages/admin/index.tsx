import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper, Typography, Stack, ListItemButton, Modal } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, SafeUser } from '@lems/types';
import { serverSideGetRequests } from '../../lib/utils/fetch';
import Layout from '../../components/layout';
import EventSelector from '../../components/general/division-selector';
import EventCreateForm from '../../components/admin/division-create-form';

interface Props {
  user: WithId<SafeUser>;
  divisions: Array<WithId<Event>>;
}

const Page: NextPage<Props> = ({ user, divisions }) => {
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
            divisions={divisions}
            onChange={divisionId => router.push(`/admin/division/${divisionId}`)}
          />
          <ListItemButton
            key={'create-division'}
            dense
            sx={{ borderRadius: 2, minHeight: '50px' }}
            onClick={handleOpen}
          >
            צור אירוע
          </ListItemButton>
          <Modal open={open} onClose={handleClose} aria-labelledby="create-division-model">
            <EventCreateForm />
          </Modal>
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    { user: '/api/me', divisions: '/public/divisions' },
    ctx
  );
  return { props: data };
};

export default Page;
