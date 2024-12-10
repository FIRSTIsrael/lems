import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Stack } from '@mui/material';
import {
  DivisionState,
  RobotGameMatch,
  RobotGameTable,
  SafeUser,
  Team,
  DivisionWithEvent
} from '@lems/types';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import ReportLink from '../../components/general/report-link';
import ConnectionIndicator from '../../components/connection-indicator';
import InsightsLink from '../../components/general/insights-link';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import { localizeDivisionTitle } from '../../localization/event';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  matches: initialMatches,
  tables
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);

  const handleTeamRegistered = (team: WithId<Team>) => {
    setTeams(teams =>
      teams.map(t => {
        if (t._id == team._id) {
          return team;
        }
        return t;
      })
    );
  };

  const handleMatchEvent = (
    match: WithId<RobotGameMatch>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newDivisionState) setDivisionState(newDivisionState);
  };

  const { connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'pit-admin', 'audience-display'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'audienceDisplayUpdated', handler: setDivisionState },
      { name: 'presentationUpdated', handler: setDivisionState }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['field-manager']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            {divisionState.completed ? <InsightsLink /> : <ReportLink />}
          </Stack>
        }
        color={division.color}
      >
        <Paper sx={{ mt: 2 }}>יוזר פטא</Paper>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}?withEvent=true`,
        teams: `/api/divisions/${divisionId}/teams`,
        divisionState: `/api/divisions/${divisionId}/state`,
        matches: `/api/divisions/${divisionId}/matches`,
        tables: `/api/divisions/${divisionId}/tables`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
