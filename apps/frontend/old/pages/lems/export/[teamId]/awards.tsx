import { GetServerSideProps, NextPage } from 'next';
import { WithId } from 'mongodb';
import { Box, Stack } from '@mui/material';
import {
  Award,
  CoreValuesAwards,
  CoreValuesAwardsTypes,
  DivisionWithEvent,
  SafeUser,
  Team,
  AwardSchema
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import { serverSideGetRequests, getUserAndDivision } from '../../../../lib/utils/fetch';
import ExportAward, { AwardToExport } from '../../../../components/export/export-award';
import ExportParticipationAward from '../../../../components/export/export-participation-award';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  team: WithId<Team>;
  awards: Array<Award>;
  awardSchema: AwardSchema;
}

const ExportAwards: NextPage<Props> = ({ user, division, team, awards, awardSchema }) => {
  const awardsToExport: Array<AwardToExport> = awards
    .filter(a => a.name !== 'advancement')
    .map(a => {
      const showPlace =
        !CoreValuesAwardsTypes.includes(a.name as CoreValuesAwards) &&
        awardSchema[a.name]?.count > 1;
      return { ...a, place: showPlace ? a.place : 0, isParticipation: false };
    });
  awardsToExport.push({ isParticipation: true });

  return (
    <RoleAuthorizer user={user} allowedRoles={[]}>
      <Stack spacing={0}>
        {awardsToExport.map((award, index) => (
          <Box
            key={index}
            sx={{
              height: '100vh',
              pageBreakAfter: index === awardsToExport.length - 1 ? 'avoid' : 'always',
              position: 'relative',
              '@media print': {
                margin: 0
              }
            }}
          >
            {award.isParticipation ? (
              <ExportParticipationAward division={division} team={team} />
            ) : (
              <ExportAward division={division} team={team} award={award} />
            )}
          </Box>
        ))}
      </Stack>
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
        awards: `/api/divisions/${divisionId}/teams/${ctx.params?.teamId}/awards`,
        awardSchema: `/api/admin/divisions/${divisionId}/awards/schema`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default ExportAwards;
