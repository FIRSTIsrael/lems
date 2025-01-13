import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { FllEvent, Division, AwardSchema } from '@lems/types';
import { apiFetch } from '../../../../lib/utils/fetch';
import Layout from '../../../../components/layout';
import EditEventForm from '../../../../components/admin/edit-event-form';
import DivisionLink from '../../../../components/admin/division-link';
import { Paper, Stack } from '@mui/material';
import DownloadUsersButton from '../../../../components/admin/download-users';
import UploadFileButton from '../../../../components/general/upload-file';
import DivisionTabEditor from '../../../../components/admin/division-tab-editor';
import dayjs from 'dayjs';

interface Props {
  event: WithId<FllEvent>;
  division: WithId<Division> | null;
  awardSchema: AwardSchema | null;
}

const Page: NextPage<Props> = ({ event, division, awardSchema }) => {
  return (
    <Layout maxWidth="lg" title={`ניהול אירוע: ${event.name}`} back="/admin">
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
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                    <UploadFileButton
                      urlPath={`/api/admin/divisions/${division?._id}/schedule/parse`}
                      displayName="לוח זמנים"
                      extension=".csv"
                      disabled={division?.hasState}
                      requestData={{ timezone: dayjs.tz.guess() }}
                    />
                    <UploadFileButton
                      urlPath={`/api/admin/divisions/${division?._id}/pit-map`}
                      displayName="מפת פיטים"
                      extension=".png"
                      reload={false}
                    />
                    <DownloadUsersButton division={division} disabled={!division?.hasState} />
                  </Stack>
                </Paper>
                <DivisionTabEditor event={event} division={division} awardSchema={awardSchema} />
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
