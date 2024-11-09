import { GetServerSideProps, NextPage } from 'next';
import { Paper } from '@mui/material';
import { WithId } from 'mongodb';
import { FllEvent, Division } from '@lems/types';
import { apiFetch } from '../../../../lib/utils/fetch';
import Layout from '../../../../components/layout';

interface Props {
  event: WithId<FllEvent>;
  divisions: Array<WithId<Division>>;
}

const Page: NextPage<Props> = ({ event, divisions }) => {
  return (
    <Layout maxWidth="md" title={`ניהול אירוע: ${event.name}`} back="/admin">
      <Paper sx={{ mt: 2 }}>TODO</Paper>
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
