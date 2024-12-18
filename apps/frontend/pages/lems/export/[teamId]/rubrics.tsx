import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Box } from '@mui/material';
import { DivisionWithEvent, JudgingCategory, Rubric, SafeUser, Team } from '@lems/types';
import { ExportRubric } from '../../../../components/export/export-rubric';
import { ExportRubricFeedback } from '../../../../components/export/export-rubric-feedback';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { serverSideGetRequests, getUserAndDivision } from '../../../../lib/utils/fetch';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const ExportRubricsPage: NextPage<Props> = ({ user, division, team, rubrics }) => {
  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      <Box sx={{ '@media print': { pageBreakAfter: 'avoid', pageBreakInside: 'avoid' } }}>
        {rubrics.map(rubric => {
          // if (rubric.category === 'core-values') return;

          return (
            <ExportRubric
              key={rubric._id.toString()}
              division={division}
              team={team}
              rubric={rubric}
              showFeedback={true}
            />
          );
        })}
      </Box>
      <ExportRubricFeedback rubrics={rubrics} division={division} team={team} />
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { user, divisionId } = await getUserAndDivision(ctx);

  try {
    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        team: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}`,
        rubrics: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default ExportRubricsPage;
