import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Event, SafeUser, RobotGameMatch, RobotGameTable, ALLOW_MATCH_SELECTOR } from '@lems/types';
import { RoleAuthorizer } from '../../../../../components/role-authorizer';
import Layout from '../../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  match: WithId<RobotGameMatch>;
}

const Page: NextPage<Props> = ({ user, event, table, match: initialMatch }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles="referee">
      <Layout maxWidth={800} title={`שולחן ${table.name} | ${event.name}`}></Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    if (!ALLOW_MATCH_SELECTOR)
      return {
        redirect: { destination: `/event/${ctx.params?.eventId}/${user.role}`, permanent: false }
      };

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        table: `/api/events/${user.eventId}/tables/${user.roleAssociation.value}`,
        match: `/api/events/${user.eventId}/matches/${ctx.params?.matchId}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
