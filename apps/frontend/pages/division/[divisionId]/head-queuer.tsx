import { useState, useMemo } from 'react';
import { WithId } from 'mongodb';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';
import { Stack } from '@mui/material';
import {
  Division,
  DivisionState,
  SafeUser,
  Team,
  RobotGameMatch,
  RobotGameTable,
  JudgingSession,
  JudgingRoom
} from '@lems/types';
import { useWebsocket } from '../../../hooks/use-websocket';
import ConnectionIndicator from '../../../components/connection-indicator';
import ReportLink from '../../../components/general/report-link';
import ActiveMatch from '../../../components/field/scorekeeper/active-match';
import Layout from '../../../components/layout';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import HeadQueuerFieldSchedule from '../../../components/queueing/head-queuer-field-schedule';
import HeadQueuerJudgingSchedule from '../../../components/queueing/head-queuer-judging-schedule';
import JudgingStatusTimer from '../../../components/judging/judging-status-timer';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedDivisionSection, localizedRoles } from '../../../localization/roles';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  sessions: Array<WithId<JudgingSession>>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  sessions: initialSessions,
  teams: initialTeams,
  tables,
  rooms,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);

  const activeMatch = useMemo(
    () => matches.find(match => match._id === divisionState.activeMatch) || null,
    [divisionState.activeMatch, matches]
  );
  const loadedMatch = useMemo(
    () => matches.find(match => match._id === divisionState.loadedMatch) || null,
    [divisionState.loadedMatch, matches]
  );
  const currentSessions = useMemo(
    () => sessions.filter(session => session.number === divisionState.currentSession),
    [sessions, divisionState]
  );
  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === divisionState.currentSession + 1),
    [sessions, divisionState]
  );

  const handleMatchDivision = (
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

  const handleSessionDivision = (
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
    ['field', 'pit-admin', 'judging'],
    undefined,
    [
      { name: 'matchLoaded', handler: handleMatchDivision },
      { name: 'matchStarted', handler: handleMatchDivision },
      { name: 'matchCompleted', handler: handleMatchDivision },
      { name: 'matchUpdated', handler: handleMatchDivision },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'judgingSessionStarted', handler: handleSessionDivision },
      { name: 'judgingSessionCompleted', handler: handleSessionDivision },
      { name: 'judgingSessionAborted', handler: handleSessionDivision },
      { name: 'judgingSessionUpdated', handler: handleSessionDivision }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['head-queuer']}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        title={`ממשק ${user.role && localizedRoles[user.role].name} | מתחם ${localizedDivisionSection[user.roleAssociation?.value as string].name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            <ReportLink division={division} />
          </Stack>
        }
        color={division.color}
      >
        {user.roleAssociation?.value === 'field' && (
          <>
            <Stack direction="row" spacing={2} my={2}>
              <ActiveMatch title="מקצה רץ" match={activeMatch} startTime={activeMatch?.startTime} />
              <ActiveMatch title="המקצה הבא" match={loadedMatch} showDelay={true} />
            </Stack>
            <HeadQueuerFieldSchedule
              divisionId={division._id}
              teams={teams}
              tables={tables}
              matches={matches.filter(m => m.stage !== 'test') || []}
              sessions={sessions}
              socket={socket}
            />
          </>
        )}
        {user.roleAssociation?.value === 'judging' && (
          <>
            <JudgingStatusTimer
              teams={teams}
              currentSessions={currentSessions}
              nextSessions={nextSessions}
            />
            <HeadQueuerJudgingSchedule
              divisionId={division._id}
              rooms={rooms}
              activeMatch={activeMatch}
              loadedMatch={loadedMatch}
              matches={matches}
              sessions={sessions}
              socket={socket}
              teams={teams}
            />
          </>
        )}
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
        rooms: `/api/divisions/${user.divisionId}/rooms`,
        sessions: `/api/divisions/${user.divisionId}/sessions`,
        tables: `/api/divisions/${user.divisionId}/tables`,
        matches: `/api/divisions/${user.divisionId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
