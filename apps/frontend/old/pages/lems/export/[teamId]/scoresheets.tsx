import { Team, Scoresheet, SafeUser , DivisionWithEvent } from '@lems/types';
import { WithId } from 'mongodb';
import { NextPage, GetServerSideProps } from 'next';
import { Box } from '@mui/material';
import { serverSideGetRequests , getUserAndDivision } from '../../../../lib/utils/fetch';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { ExportScoresheetPage } from '../../../../components/export/scoresheets/scoresheet-page';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  scoresheets: Array<WithId<Scoresheet>>;
}

const Page: NextPage<Props> = ({ user, division, team, scoresheets }) => {
  const scoresheetsToExport = scoresheets.filter(scoresheet => scoresheet.status === 'ready');

  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      {scoresheetsToExport.map((scoresheet, index) => {
        const isLastScoresheet = index === scoresheets.length - 1;
        return (
          <Box
            key={scoresheet._id.toString()}
            sx={{ '@media print': { pageBreakAfter: isLastScoresheet ? 'avoid' : 'always' } }}
          >
            <ExportScoresheetPage division={division} team={team} scoresheet={scoresheet} />
          </Box>
        );
      })}
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
        scoresheets: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/scoresheets`
      },
      ctx
    );
    data.scoresheets = data.scoresheets.filter(
      (scoresheet: Scoresheet) => scoresheet.stage !== 'practice'
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
