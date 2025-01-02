import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { DivisionWithEvent, SafeUser, Team } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { serverSideGetRequests, getUserAndDivision } from '../../../../lib/utils/fetch';
import ExportAward from '../../../../components/export/export-award';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
}

const ExportAwards: NextPage<Props> = ({ user, division, team }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      <ExportAward division={division} team={team} />
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user, divisionId } = await getUserAndDivision(ctx);

  try {
    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        team: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default ExportAwards;
