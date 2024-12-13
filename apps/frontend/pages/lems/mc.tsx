import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Tabs, Tab } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  DivisionState,
  RobotGameMatch,
  RobotGameTable,
  SafeUser,
  Team,
  Award,
  DivisionWithEvent
} from '@lems/types';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import McSchedule from '../../components/mc/mc-schedule';
import AwardsLineup from '../../components/mc/awards-lineup';
import AwardsNotReadyCard from '../../components/mc/awards-not-ready-card';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import { localizeDivisionTitle } from '../../localization/event';
import { useQueryParam } from '../../hooks/use-query-param';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  awards: Array<WithId<Award>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  matches: initialMatches,
  tables,
  awards: initialAwards
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [awards, setAwards] = useState<Array<WithId<Award>>>(initialAwards);

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
      { name: 'presentationUpdated', handler: setDivisionState },
      { name: 'awardsUpdated', handler: setAwards }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['mc']}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        user={user}
        connectionStatus={connectionStatus}
        color={division.color}
      >
        <TabContext value={activeTab}>
          <Paper sx={{ mt: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_e, newValue: string) => setActiveTab(newValue)}
              centered
            >
              <Tab label='לו"ז זירה' value="1" />
              <Tab label="פרסים" value="2" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <McSchedule
              divisionState={divisionState}
              teams={teams}
              matches={matches}
              tables={tables}
            />
          </TabPanel>
          <TabPanel value="2">
            {divisionState.presentations['awards']?.enabled ? (
              <AwardsLineup division={division} awards={awards} />
            ) : (
              <AwardsNotReadyCard />
            )}
          </TabPanel>
        </TabContext>
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
        tables: `/api/divisions/${divisionId}/tables`,
        awards: `/api/divisions/${divisionId}/awards`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
