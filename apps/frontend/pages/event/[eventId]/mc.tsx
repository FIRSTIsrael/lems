import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Typography } from '@mui/material';
import { Event, User, RoleTypes } from '@lems/types';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';

interface Props {
  user: User;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();
  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
      >
        <Paper sx={{ p: 4, mt: 2 }}>
          <Typography variant="h1" align="center">
            בקרוב
          </Typography>
        </Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests({ event: `/api/events/${user.eventId}` }, ctx);

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
