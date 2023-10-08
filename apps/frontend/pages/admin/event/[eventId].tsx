import { GetServerSideProps, NextPage } from 'next';
import { Paper, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Event } from '@lems/types';
import { serverSideGetRequests } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import UploadScheduleButton from '../../../components/admin/upload-schedule';
import EditEventForm from '../../../components/admin/edit-event-form';
import DeleteEventData from '../../../components/admin/delete-event-data';
import EventScheduleEditor from '../../../components/admin/event-schedule-editor';
import DownloadUsersButton from '../../../components/admin/download-users';

interface Props {
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ event }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <Paper sx={{ p: 4, mt: 4 }}>
        <EditEventForm event={event} />
      </Paper>

      <Paper sx={{ p: 4, mt: 2 }}>
        <EventScheduleEditor event={event} />
      </Paper>

      <Paper sx={{ p: 4, my: 2 }}>
        {event.hasState && <DeleteEventData event={event} />}
        <Stack justifyContent="center" direction="row" spacing={2}>
          <UploadScheduleButton event={event} disabled={event.hasState} />
          <GenerateScheduleButton event={event} />
          <DownloadUsersButton event={event} disabled={!event.hasState} />
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    {
      event: `/api/events/${ctx.params?.eventId}?withSchedule=true`
    },
    ctx
  );
  return { props: data };
};

export default Page;
