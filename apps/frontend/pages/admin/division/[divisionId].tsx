import dayjs from 'dayjs';
import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import { WithId } from 'mongodb';
import { Division, AwardSchema } from '@lems/types';
import { serverSideGetRequests } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import GenerateScheduleButton from '../../../components/admin/generate-schedule';
import EditDivisionForm from '../../../components/admin/edit-division-form';
import DivisionAwardEditor from '../../../components/admin/division-award-editor';
import DeleteDivisionData from '../../../components/admin/delete-division-data';
import DivisionScheduleEditor from '../../../components/admin/division-schedule-editor';
import DownloadUsersButton from '../../../components/admin/download-users';
import UploadFileButton from '../../../components/general/upload-file';

interface Props {
  division: WithId<Division>;
  awardSchema: AwardSchema;
}

const Page: NextPage<Props> = ({ division, awardSchema }) => {
  const [activeTab, setActiveTab] = useState<string>('1');

  return (
    <Layout
      maxWidth="md"
      title={`ניהול אירוע: ${division.name}`}
      back="/admin"
      color={division.color}
    >
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
            <EditDivisionForm division={division} />
            <Paper sx={{ p: 4 }}>
              {division.hasState && <DeleteDivisionData division={division} />}
              <Stack justifyContent="center" direction="row" spacing={2}>
                <UploadFileButton
                  urlPath={`/api/admin/divisions/${division._id}/schedule/parse`}
                  displayName="לוח זמנים"
                  extension=".csv"
                  disabled={division.hasState}
                  requestData={{ timezone: dayjs.tz.guess() }}
                />
                <GenerateScheduleButton division={division} />
                <DownloadUsersButton division={division} disabled={!division.hasState} />
              </Stack>
            </Paper>
            <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
              <UploadFileButton
                urlPath={`/api/admin/divisions/${division._id}/pit-map`}
                displayName="מפת פיטים"
                extension=".png"
              />
            </Paper>
          </Stack>
        </TabPanel>
        <TabPanel value="2">
          <DivisionScheduleEditor division={division} />
        </TabPanel>
        <TabPanel value="3">
          <DivisionAwardEditor divisionId={division._id} awardSchema={awardSchema} />
        </TabPanel>
      </TabContext>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const data = await serverSideGetRequests(
    {
      division: `/api/divisions/${ctx.params?.divisionId}?withSchedule=true`,
      awardSchema: `/api/admin/divisions/${ctx.params?.divisionId}/awards/schema`
    },
    ctx
  );

  return { props: data };
};

export default Page;
