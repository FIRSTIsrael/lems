import { GetServerSideProps, NextPage } from 'next';
import { Paper, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, EventState, SafeUser } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import UploadScheduleButton from '../../../components/admin/upload-schedule';
import EditEventForm from '../../../components/admin/edit-event-form';
import DeleteEventData from '../../../components/admin/delete-event-data';
import EventPlanner from '../../../components/admin/event-planner';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState> | undefined;
}

const Page: NextPage<Props> = ({ user, event, eventState }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <Paper sx={{ p: 4, mt: 4 }}>
        <EditEventForm event={event} />
      </Paper>

      <Paper sx={{ p: 4, mt: 2 }}>
        <EventPlanner event={event} />
      </Paper>

      <Paper sx={{ p: 4, mt: 2 }}>
        {eventState && <DeleteEventData event={event} />}
        <Stack justifyContent="center" direction="row" spacing={2}>
          <UploadScheduleButton event={event} disabled={!!eventState} />
          <GenerateScheduleButton event={event} />
        </Stack>
      </Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const event = await apiFetch(
    `/api/events/${ctx.params?.eventId}?withPlan=true`,
    undefined,
    ctx
  ).then(res => res?.json());

  const eventState = await apiFetch(
    `/api/events/${ctx.params?.eventId}/state`,
    undefined,
    ctx
  ).then(res => res.json());

  return { props: { user, event, eventState } };
};

export default Page;
