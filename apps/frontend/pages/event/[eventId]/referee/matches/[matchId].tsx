import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Event, SafeUser, RobotGameMatch, RobotGameTable, ALLOW_MATCH_SELECTOR } from '@lems/types';
import { RoleAuthorizer } from '../../../../../components/role-authorizer';
import Layout from '../../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Event>;
  table: WithId<RobotGameTable>;
  match: WithId<RobotGameMatch>;
}

const Page: NextPage<Props> = ({ user, division, table, match: initialMatch }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles="referee">
      <Layout maxWidth={800} title={`שולחן ${table.name} | ${division.name}`}></Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    if (!ALLOW_MATCH_SELECTOR)
      return {
        redirect: {
          destination: `/division/${ctx.params?.divisionId}/${user.role}`,
          permanent: false
        }
      };

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        table: `/api/divisions/${user.divisionId}/tables/${user.roleAssociation.value}`,
        match: `/api/divisions/${user.divisionId}/matches/${ctx.params?.matchId}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
