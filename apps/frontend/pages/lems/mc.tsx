import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Paper, Tabs, Tab } from '@mui/material';
import { TabContext, TabPanel } from '@mui/lab';
import {
  Division,
  DivisionState,
  RobotGameMatch,
  RobotGameTable,
  SafeUser,
  Team
} from '@lems/types';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import McSchedule from '../../components/mc/mc-schedule';
import AwardsLineup from '../../components/mc/awards-lineup';
import AwardsNotReadyCard from '../../components/mc/awards-not-ready-card';
import ReportLink from '../../components/general/report-link';
import { apiFetch, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
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
  const [activeTab, setActiveTab] = useState<string>('1');
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

  useWebsocket(division._id.toString(), ['field', 'pit-admin', 'audience-display'], undefined, [
    { name: 'teamRegistered', handler: handleTeamRegistered },
    { name: 'matchLoaded', handler: handleMatchEvent },
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent },
    { name: 'matchUpdated', handler: handleMatchEvent },
    { name: 'audienceDisplayUpdated', handler: setDivisionState },
    { name: 'presentationUpdated', handler: setDivisionState }
  ]);

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
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${division.name}`}
        action={<ReportLink division={division} />}
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
              <AwardsLineup division={division} />
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
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${user.divisionId}`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        divisionState: `/api/divisions/${user.divisionId}/state`,
        matches: `/api/divisions/${user.divisionId}/matches`,
        tables: `/api/divisions/${user.divisionId}/tables`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
