import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Paper } from '@mui/material';
import { WithId } from 'mongodb';
import { Event, SafeUser } from '@lems/types';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();

  return (
    <Layout maxWidth="sm" title={`ניהול אירוע: ${event.name}`}>
      <Paper sx={{ p: 4, mt: 4 }}>פה יהיו דברים מגניבים כמו יצירת לוז</Paper>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const event = await apiFetch(`/api/events/${ctx.params?.eventId}`, undefined, ctx).then(res =>
    res?.json()
  );

  return { props: { user, event } };
};

export default Page;
