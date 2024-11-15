import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { FllEvent } from '@lems/types';
import { apiFetch } from '../../../../lib/utils/fetch';
import Layout from '../../../../components/layout';
import EditEventForm from '../../../../components/admin/edit-event-form';
import DivisionLink from '../../../../components/admin/division-link';

interface Props {
  event: WithId<FllEvent>;
}

const Page: NextPage<Props> = ({ event }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <EditEventForm sx={{ p: 4, mt: 2 }} event={event} />
      {event.enableDivisions && event.divisions && event.divisions?.length > 1 ? (
        event.divisions.map(division => (
          <DivisionLink key={String(division._id)} division={division} />
        ))
      ) : (
        <></>
      )}
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

  return { props: { event, divisions } };
};

export default Page;
