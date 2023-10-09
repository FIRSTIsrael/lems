import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Event, Team, SafeUser, RoleTypes } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import FIRSTLogo from '../../../components/audience-display/first-logo';
import HotspotReminder from '../../../components/audience-display/hotspot-reminder';
import Sponsors from '../../../components/audience-display/sponsors';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

type AudienceDisplayState = 'scores' | 'awards' | 'sponsors' | 'logo' | 'hotspot';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, teams: initialTeams }) => {
  const router = useRouter();
  const [state, setState] = useState<AudienceDisplayState>('sponsors');

  // const handleTeamRegistered = (team: WithId<Team>) => {
  //   setTeams(teams =>
  //     teams.map(t => {
  //       if (t._id == team._id) {
  //         return team;
  //       } else {
  //         return t;
  //       }
  //     })
  //   );
  // };

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
      <Layout maxWidth="xl" error={connectionStatus === 'disconnected'}>
        {state === 'logo' && <FIRSTLogo />}
        {state === 'hotspot' && <HotspotReminder />}
        {state === 'sponsors' && <Sponsors />}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.event}`,
        teams: `/api/events/${user.event}/teams`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
