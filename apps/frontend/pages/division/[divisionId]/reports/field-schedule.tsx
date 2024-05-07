import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Unstable_Grid2';
import { Division, Team, SafeUser, RoleTypes, RobotGameMatch, RobotGameTable } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import ReportRoundSchedule from '../../../../components/field/report-round-schedule';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  teams: initialTeams,
  tables,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [showGeneralSchedule, setShowGeneralSchedule] = useState<boolean>(true);
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);

  const refereeGeneralSchedule =
    (showGeneralSchedule && division.schedule?.filter(s => s.roles.includes('referee'))) || [];

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        } else {
          return t;
        }
      })
    );
  };

  const handleMatchDivision = (match: WithId<RobotGameMatch>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );
  };

  const { connectionStatus } = useWebsocket(division._id.toString(), ['pit-admin'], undefined, [
    { name: 'teamRegistered', handler: handleTeamRegistered },
    { name: 'matchUpdated', handler: handleMatchDivision }
  ]);

  const practiceMatches = matches.filter(m => m.stage === 'practice');
  const rankingMatches = matches.filter(m => m.stage === 'ranking');

  const roundSchedules = [...new Set(practiceMatches.flatMap(m => m.round))]
    .map(r => (
      <Grid xs={12} xl={6} key={'practice' + r}>
        <ReportRoundSchedule
          divisionSchedule={refereeGeneralSchedule}
          roundStage="practice"
          roundNumber={r}
          matches={practiceMatches.filter(m => m.round === r)}
          tables={tables}
          teams={teams}
        />
      </Grid>
    ))
    .concat(
      [...new Set(rankingMatches.flatMap(m => m.round))].map(r => (
        <Grid xs={12} xl={6} key={'ranking' + r}>
          <ReportRoundSchedule
            divisionSchedule={refereeGeneralSchedule}
            roundStage="ranking"
            roundNumber={r}
            matches={rankingMatches.filter(m => m.round === r)}
            tables={tables}
            teams={teams}
          />
        </Grid>
      ))
    );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז זירה | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/division/${division._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <Grid container spacing={2} my={4}>
          {...roundSchedules}
        </Grid>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}?withSchedule=true`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        tables: `/api/divisions/${user.divisionId}/tables`,
        matches: `/api/divisions/${user.divisionId}/matches`
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
