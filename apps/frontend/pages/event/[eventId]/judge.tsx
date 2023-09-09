import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/display/welcome-header';

interface Props {
  user: SafeUser;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  room: WithId<JudgingRoom>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({ user, event }) => {
  const router = useRouter();

  return (
    <RoleAuthorizer user={user} allowedRoles="judge" onFail={() => router.back()}>
      <Layout maxWidth="md" title={`ממשק שופט | ${event.name}`}>
        <WelcomeHeader event={event} user={user} />
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

  const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
    res?.json()
  );
  const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
    res?.json()
  );
  const roomPromise = apiFetch(
    `/api/events/${user.event}/rooms/${user.roleAssociation.value}`,
    undefined,
    ctx
  ).then(res => res?.json());
  const [teams, room, event] = await Promise.all([teamsPromise, roomPromise, eventPromise]);

  const sessions = await apiFetch(
    `/api/events/${user.event}/rooms/${room._id}/sessions`,
    undefined,
    ctx
  ).then(res => res?.json());

  return { props: { user, event, teams, room, sessions } };
};

export default Page;
