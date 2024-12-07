import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { FllEvent, Division, AwardSchema } from '@lems/types';
import { apiFetch } from '../../../../lib/utils/fetch';
import Layout from '../../../../components/layout';
import EditEventForm from '../../../../components/admin/edit-event-form';
import DivisionLink from '../../../../components/admin/division-link';
import dayjs from 'dayjs';
import { TabContext, TabPanel } from '@mui/lab';
import { Paper, Tabs, Tab, Stack } from '@mui/material';
import GenerateScheduleButton from '../../../../components/admin/generate-schedule';
import DivisionAwardEditor from '../../../../components/admin/division-award-editor';
import DeleteDivisionData from '../../../../components/admin/delete-division-data';
import DivisionScheduleEditor from '../../../../components/admin/division-schedule-editor';
import DownloadUsersButton from '../../../../components/admin/download-users';
import UploadFileButton from '../../../../components/general/upload-file';
import { useQueryParam } from '../../../../hooks/use-query-param';

interface Props {
  event: WithId<FllEvent>;
  division: WithId<Division> | null;
  awardSchema: AwardSchema | null;
}

const Page: NextPage<Props> = ({ event, division, awardSchema }) => {
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');

  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <Stack spacing={2} sx={{ mt: 2 }}>
        <EditEventForm sx={{ p: 4 }} event={event} />
        {event.enableDivisions && event.divisions && event.divisions?.length > 1
          ? event.divisions.map(division => (
              <DivisionLink key={String(division._id)} division={division} />
            ))
          : division &&
            awardSchema && (
              <>
                <Paper sx={{ p: 4 }}>
                  {division?.hasState && <DeleteDivisionData division={{ ...division, event }} />}
                  <Stack justifyContent="center" direction="row" spacing={2}>
                    <UploadFileButton
                      urlPath={`/api/admin/divisions/${division?._id}/schedule/parse`}
                      displayName="לוח זמנים"
                      extension=".csv"
                      disabled={division?.hasState}
                      requestData={{ timezone: dayjs.tz.guess() }}
                    />
                    <GenerateScheduleButton division={division} />
                    <DownloadUsersButton division={division} disabled={!division?.hasState} />
                  </Stack>
                </Paper>
                <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <UploadFileButton
                    urlPath={`/api/admin/divisions/${division?._id}/pit-map`}
                    displayName="מפת פיטים"
                    extension=".png"
                  />
                </Paper>
                <TabContext value={activeTab}>
                  <Paper sx={{ mt: 2 }}>
                    <Tabs
                      value={activeTab}
                      onChange={(_e, newValue: string) => setActiveTab(newValue)}
                      centered
                    >
                      <Tab label="מסגרת אירוע" value="1" />
                      <Tab label="פרסים" value="2" />
                    </Tabs>
                  </Paper>
                  <TabPanel value="1">
                    <DivisionScheduleEditor event={event} division={division} />
                  </TabPanel>
                  <TabPanel value="2">
                    <DivisionAwardEditor divisionId={division?._id} awardSchema={awardSchema} />
                  </TabPanel>
                </TabContext>
              </>
            )}
      </Stack>
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

  const division = event.enableDivisions ? null : divisions?.[0];

  const awardSchema = division
    ? await apiFetch(
        `/api/admin/divisions/${divisions[0]?._id}/awards/schema`,
        undefined,
        ctx
      ).then(res => res?.json())
    : null;

  return { props: { event, division, awardSchema } };
};

export default Page;
