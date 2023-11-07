import { GetServerSideProps, NextPage } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Event, SafeUser, RoleTypes } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';
import { grey } from '@mui/material/colors';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();
  const PIT_MAPS_URL = 'https://fi-file-storage.nyc3.digitaloceanspaces.com/lems/pit-maps';

  const { connectionStatus } = useWebsocket(event._id.toString(), ['pit-admin'], undefined, []);

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
        maxWidth="xl"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מפת פיטים | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
      >
        <Image
          src={`${PIT_MAPS_URL}/${event._id}.png`}
          alt={`מפת פיטים ל${event.name}`}
          width={0}
          height={0}
          sizes="100vw"
          style={{
            marginTop: '40px',
            width: '100%',
            height: 'auto',
            borderRadius: '1rem',
            border: '1px solid',
            borderColor: grey[200]
          }}
        />
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
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
