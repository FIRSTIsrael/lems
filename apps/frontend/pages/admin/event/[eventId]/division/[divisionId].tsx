import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { FllEvent, AwardSchema, Division } from '@lems/types';
import { apiFetch, serverSideGetRequests } from '../../../../../lib/utils/fetch';
import Layout from '../../../../../components/layout';
import EditDivisionForm from '../../../../../components/admin/edit-division-form';
import DivisionTabEditor from '../../../../../components/admin/division-tab-editor';
import { localizeDivisionTitle } from '../../../../../localization/event';

interface Props {
  event: WithId<FllEvent>;
  division: WithId<Division>;
  awardSchema: AwardSchema;
}

const Page: NextPage<Props> = ({ event, division, awardSchema }) => {
  return (
    <Layout
      maxWidth="lg"
      title={`ניהול אירוע: ${localizeDivisionTitle({ ...division, event })}`}
      back={`/admin/event/${event._id}`}
    >
      <EditDivisionForm event={event} division={division} sx={{ mt: 2, p: 4 }} />
      <DivisionTabEditor event={event} division={division} awardSchema={awardSchema} />
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const event = await apiFetch(`/api/events/${ctx.params?.eventId}`, undefined, ctx).then(res =>
    res?.json()
  );

  const division = await apiFetch(`/api/divisions/${ctx.params?.divisionId}`, undefined, ctx).then(
    res => res?.json()
  );

  const data = await serverSideGetRequests(
    {
      awardSchema: `/api/admin/divisions/${division?._id}/awards/schema`
    },
    ctx
  );

  return { props: { event, division, ...data } };
};

export default Page;
