import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import Grid from '@mui/material/Grid2';
import {
  DivisionWithEvent,
  Team,
  SafeUser,
  RoleTypes,
  RobotGameMatch,
  RobotGameTable
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Layout from '../../../components/layout';
import ReportRoundSchedule from '../../../components/field/report-round-schedule';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';
import { localizeDivisionTitle } from '../../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
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
  const [showGeneralSchedule] = useState<boolean>(true);
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

  const handleMatchEvent = (match: WithId<RobotGameMatch>) => {
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
    { name: 'matchUpdated', handler: handleMatchEvent }
  ]);

  const roundMatches = matches
    .filter(m => m.stage !== 'test')
    .reduce((result: { [key: string]: Array<WithId<RobotGameMatch>> }, match) => {
      const roundKey = match.stage + match.round;
      (result[roundKey] = result[roundKey] || []).push(match);
      return result;
    }, {});

  const roundSchedules = Object.values(roundMatches).map(matches => (
    <Grid
      key={matches[0].stage + matches[0].round}
      size={{
        xs: 12,
        xl: 6
      }}
    >
      <ReportRoundSchedule
        divisionSchedule={refereeGeneralSchedule}
        roundStage={matches[0].stage}
        roundNumber={matches[0].round}
        matches={matches}
        tables={tables}
        teams={teams}
      />
    </Grid>
  ));

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={1800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} - לו״ז זירה | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        back={`/lems/reports`}
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withSchedule=true&withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        tables: `/api/divisions/${divisionId}/tables`,
        matches: `/api/divisions/${divisionId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
