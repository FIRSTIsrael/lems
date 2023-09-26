import { GetServerSideProps, NextPage } from 'next';
import { Paper, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, SafeUser } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import UploadScheduleButton from '../../../components/admin/upload-schedule';
import EditEventForm from '../../../components/admin/edit-event-form';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <Paper sx={{ p: 4, mt: 4 }}>
        <EditEventForm event={event} />
      </Paper>

      <Paper sx={{ p: 4, mt: 2 }}>
        <Stack justifyContent="center" direction="row" spacing={2}>
          <UploadScheduleButton event={event} />
          <GenerateScheduleButton event={event} />
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const event = await apiFetch(`/api/events/${ctx.params?.eventId}`, undefined, ctx).then(res =>
    res?.json()
  );

  return { props: { user, event } };
};

export default Page;
