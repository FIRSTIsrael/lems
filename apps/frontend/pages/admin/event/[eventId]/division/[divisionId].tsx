import dayjs from 'dayjs';
import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { FllEvent, Division, AwardSchema } from '@lems/types';
import { apiFetch, serverSideGetRequests } from '../../../../../lib/utils/fetch';
import Layout from '../../../../../components/layout';
import GenerateScheduleButton from '../../../../../components/admin/generate-schedule';
import EditDivisionForm from '../../../../../components/admin/edit-division-form';
import DivisionAwardEditor from '../../../../../components/admin/division-award-editor';
import DeleteDivisionData from '../../../../../components/admin/delete-division-data';
import DivisionScheduleEditor from '../../../../../components/admin/division-schedule-editor';
import DownloadUsersButton from '../../../../../components/admin/download-users';
import UploadFileButton from '../../../../../components/general/upload-file';

interface Props {
  event: WithId<FllEvent>;
  divisions: Array<WithId<Division>>;
  awardSchema: AwardSchema;
}

const Page: NextPage<Props> = ({ event, divisions, awardSchema }) => {
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
            <EditDivisionForm event={event} division={divisions[0]} />
            <Paper sx={{ p: 4 }}>
              {divisions[0]?.hasState && <DeleteDivisionData division={divisions[0]} />}
              <Stack justifyContent="center" direction="row" spacing={2}>
                <UploadFileButton
                  urlPath={`/api/admin/divisions/${divisions[0]?._id}/schedule/parse`}
                  displayName="לוח זמנים"
                  extension=".csv"
                  disabled={divisions[0]?.hasState}
                  requestData={{ timezone: dayjs.tz.guess() }}
                />
                <GenerateScheduleButton division={divisions[0]} />
                <DownloadUsersButton division={divisions[0]} disabled={!divisions[0]?.hasState} />
              </Stack>
            </Paper>
            <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <UploadFileButton
                urlPath={`/api/admin/divisions/${divisions[0]?._id}/pit-map`}
                displayName="מפת פיטים"
                extension=".png"
              />
            </Paper>
          </Stack>
        </TabPanel>
        <TabPanel value="2">
          <DivisionScheduleEditor event={event} division={divisions[0]} />
        </TabPanel>
        <TabPanel value="3">
          <DivisionAwardEditor divisionId={divisions[0]?._id} awardSchema={awardSchema} />
        </TabPanel>
      </TabContext>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const event = await apiFetch(`/api/events/${ctx.params?.eventId}`, undefined, ctx).then(res =>
    res?.json()
  );
  const divisions = await apiFetch(
    `/api/events/${ctx.params?.eventId}/divisions?withSchedule=true`,
    undefined,
    ctx
  ).then(res => res?.json());

  const data = await serverSideGetRequests(
    {
      awardSchema: `/api/admin/divisions/${divisions[0]?._id}/awards/schema`
    },
    ctx
  );

  return { props: { event, divisions, ...data } };
};

export default Page;
