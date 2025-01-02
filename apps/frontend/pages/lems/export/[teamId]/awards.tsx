import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Box } from '@mui/material';
import { Award, DivisionWithEvent, SafeUser, Team } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { serverSideGetRequests, getUserAndDivision } from '../../../../lib/utils/fetch';
import ExportAward, { AwardToExport } from '../../../../components/export/export-award';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  awards: Array<Award>;
}

const ExportAwards: NextPage<Props> = ({ user, division, team, awards }) => {
  const awardsToExport: Array<AwardToExport> = awards.map(a => ({ ...a, isParticipation: false }));
  awardsToExport.push({ isParticipation: true });

  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      {awardsToExport.map((award, index) => (
        <Box
          key={index}
          sx={{
            '@media print': {
              page: {
                size: 'A4',
                margin: 0
              },
              pageBreakAfter: index === awardsToExport.length - 1 ? 'avoid' : 'always'
            }
          }}
        >
          <ExportAward division={division} team={team} award={award} />
        </Box>
      ))}
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
        awards: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/awards`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default ExportAwards;
