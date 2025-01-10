import { useState } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import {
  DivisionState,
  RobotGameMatch,
  RobotGameTable,
  SafeUser,
  Team,
  DivisionWithEvent,
  JudgingSession,
  RobotGameMatchParticipant,
  CoreValuesForm
} from '@lems/types';
import { TabPanel, TabContext } from '@mui/lab';
import { Paper, Tab, Tabs } from '@mui/material';
import Layout from '../../components/layout';
import { RoleAuthorizer } from '../../components/role-authorizer';
import CVPanel from '../../components/cv-form/cv-panel';
import { getUserAndDivision, serverSideGetRequests } from '../../lib/utils/fetch';
import { localizedRoles } from '../../localization/roles';
import { useWebsocket } from '../../hooks/use-websocket';
import { useQueryParam } from '../../hooks/use-query-param';
import { localizeDivisionTitle } from '../../localization/event';
import RematchManager from '../../components/field-manager/rematch-manager';
import StaggerEditor from '../../components/field-manager/stagger-editor/stagger-editor';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  tables: Array<WithId<RobotGameTable>>;
  cvForms: Array<WithId<CoreValuesForm>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  teams: initialTeams,
  matches: initialMatches,
  sessions: initialSessions,
  cvForms: initialCvForms
}) => {
  const [activeTab, setActiveTab] = useQueryParam('tab', '1');
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [cvForms, setCvForms] = useState<Array<WithId<CoreValuesForm>>>(initialCvForms);

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

  const handleSessionEvent = (
    session: WithId<JudgingSession>,
    newDivisionState?: WithId<DivisionState>
  ) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );

    if (newDivisionState) setDivisionState(newDivisionState);
  };

  const { socket, connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'judging', 'pit-admin', 'audience-display'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent }
    ]
  );

  const handleScheduleRematch = (
    team: WithId<Team>,
    match: WithId<RobotGameMatch>,
    participantIndex: number
  ) => {
    const newMatchParticipants = match.participants.map((participant, index) => {
      const { tableId, teamId } = participant;
      return { tableId, teamId: index === participantIndex ? team._id : teamId };
    }) as Array<Partial<RobotGameMatchParticipant>>;

    socket.emit(
      'updateMatchTeams',
      match.divisionId.toString(),
      match._id.toString(),
      newMatchParticipants,
      response => {
        if (response.ok) {
          enqueueSnackbar('המקצה עודכן בהצלחה!', { variant: 'success' });
        } else {
          enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const handleSwitchParticipants = (
    fromMatch: WithId<RobotGameMatch>,
    toMatch: WithId<RobotGameMatch>,
    participantIndex: number
  ) => {
    socket.emit(
      'switchMatchTeams',
      fromMatch.divisionId.toString(),
      fromMatch._id.toString(),
      toMatch._id.toString(),
      participantIndex,
      response => {
        if (response.ok) {
          enqueueSnackbar('המקצה עודכן בהצלחה!', { variant: 'success' });
        } else {
          enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
        }
      }
    );
  };

  const handleMergeMatches = (
    fromMatch: WithId<RobotGameMatch>,
    toMatch: WithId<RobotGameMatch>
  ) => {
    socket.emit(
      'mergeMatches',
      fromMatch.divisionId.toString(),
      fromMatch._id.toString(),
      toMatch._id.toString(),
      response => {
        if (response.ok) {
          enqueueSnackbar('המקצים מוזגו בהצלחה!', { variant: 'success' });
        } else {
          enqueueSnackbar('אופס, מיזוג המקצים נכשל.', { variant: 'error' });
        }
      }
    );
  };

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
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${localizeDivisionTitle(division)}`}
        user={user}
        division={division}
        divisionState={divisionState}
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
              <Tab label="הענקת מקצה חוזר" value="1" />
              <Tab label="טפסי CV" value="2" />
            </Tabs>
          </Paper>
          <TabPanel value="1">
            <RematchManager
              teams={teams}
              matches={matches}
              divisionState={divisionState}
              sessions={sessions}
              isStaggered={!!division.staggered}
              onScheduleRematch={handleScheduleRematch}
            />
            {division.staggered && (
              <StaggerEditor
                divisionState={divisionState}
                matches={matches}
                teams={teams}
                onSwitchParticipants={handleSwitchParticipants}
                onMergeMatches={handleMergeMatches}
              />
            )}
          </TabPanel>
          <TabPanel value={'2'}>
            <CVPanel
              user={user}
              teams={teams}
              cvForms={cvForms}
              division={division}
              socket={socket}
            />
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
        sessions: `/api/divisions/${divisionId}/sessions`,
        tables: `/api/divisions/${divisionId}/tables`,
        cvForms: `/api/divisions/${divisionId}/cv-forms`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
