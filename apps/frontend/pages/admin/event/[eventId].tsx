import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, AwardSchema } from '@lems/types';
import { serverSideGetRequests } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import EditEventForm from '../../../components/admin/edit-event-form';
import EventAwardEditor from '../../../components/admin/event-award-editor';
import DeleteEventData from '../../../components/admin/delete-event-data';
import EventScheduleEditor from '../../../components/admin/event-schedule-editor';
import DownloadUsersButton from '../../../components/admin/download-users';
import UploadFileButton from '../../../components/admin/upload-file';

interface Props {
  event: WithId<Event>;
  awardSchema: AwardSchema;
}

const Page: NextPage<Props> = ({ event, awardSchema }) => {
  const [activeTab, setActiveTab] = useState<string>('1');

  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <TabContext value={activeTab}>
        <Paper sx={{ mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_e, newValue: string) => setActiveTab(newValue)}
            centered
          >
            <Tab label="פרטי האירוע" value="1" />
            <Tab label="לוח זמנים" value="2" />
            <Tab label="פרסים" value="3" />
          </Tabs>
        </Paper>
        <TabPanel value="1">
          <Stack spacing={2}>
            <EditEventForm event={event} />
            <Paper sx={{ p: 4 }}>
              {event.hasState && <DeleteEventData event={event} />}
              <Stack justifyContent="center" direction="row" spacing={2}>
                <UploadFileButton
                  urlPath={`/api/admin/events/${event._id}/schedule/parse`}
                  displayName="לוח זמנים"
                  extension=".csv"
                  disabled={event.hasState}
                />
                <GenerateScheduleButton event={event} />
                <DownloadUsersButton event={event} disabled={!event.hasState} />
              </Stack>
            </Paper>
            <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <UploadFileButton
                urlPath={`/api/admin/events/${event._id}/pit-map`}
                displayName="מפת פיטים"
                extension=".png"
              />
            </Paper>
          </Stack>
        </TabPanel>
        <TabPanel value="2">
          <EventScheduleEditor event={event} />
        </TabPanel>
        <TabPanel value="3">
          <EventAwardEditor eventId={event._id} awardSchema={awardSchema} />
        </TabPanel>
      </TabContext>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    {
      event: `/api/events/${ctx.params?.eventId}?withSchedule=true`,
      awardSchema: `/api/admin/events/${ctx.params?.eventId}/awards/schema`
    },
    ctx
  );

  return { props: data };
};

export default Page;
