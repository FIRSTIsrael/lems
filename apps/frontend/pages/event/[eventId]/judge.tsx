import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  Event,
  Team,
  JudgingRoom,
  Rubric,
  JudgingSession,
  SafeUser,
  JudgingCategory,
  EventState
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/general/welcome-header';
import JudgingTimer from '../../../components/judging/judging-timer';
import AbortJudgingSessionButton from '../../../components/judging/abort-judging-session-button';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  room,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);

  const currentSession = useMemo(
    () => sessions.find((s: WithId<JudgingSession>) => s.status === 'in-progress'),
    [sessions]
  );

  const activeTeam = useMemo(() => {
    return currentSession
      ? teams.find((t: WithId<Team>) => t._id == currentSession.team) || ({} as WithId<Team>)
      : ({} as WithId<Team>);
  }, [teams, currentSession]);

  const handleSessionEvent = (session: WithId<JudgingSession>, eventState?: WithId<EventState>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );
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

  const updateRubric = (rubric: WithId<Rubric<JudgingCategory>>) => {
    setRubrics(rubrics =>
      rubrics.map(r => {
        if (r._id === rubric._id) {
          return rubric;
        }
        return r;
      })
    );
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="judge"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {currentSession && activeTeam ? (
          <>
            <JudgingTimer session={currentSession} team={activeTeam} />
            <Box display="flex" justifyContent="center">
              <AbortJudgingSessionButton
                event={event}
                room={room}
                session={currentSession}
                socket={socket}
                sx={{ mt: 2.5 }}
              />
            </Box>
          </>
        ) : (
          <>
            <WelcomeHeader event={event} user={user} />
            <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
              <RubricStatusReferences />
            </Paper>
            <Paper sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  p: 3,
                  pb: 1
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: '#ede9fe',
                    color: '#a78bfa',
                    width: '2rem',
                    height: '2rem',
                    mr: 1
                  }}
                >
                  <JudgingRoomIcon sx={{ fontSize: '1rem' }} />
                </Avatar>
                <Typography variant="h2" fontSize="1.25rem">
                  חדר שיפוט {room.name}
                </Typography>
              </Box>
              <JudgingRoomSchedule
                sessions={sessions}
                event={event}
                room={room}
                teams={teams}
                user={user}
                rubrics={rubrics}
                socket={socket}
              />
            </Paper>
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
        event: `/api/events/${user.event}`,
        teams: `/api/events/${user.event}/teams`,
        room: `/api/events/${user.event}/rooms/${user.roleAssociation.value}`,
        sessions: `/api/events/${user.event}/rooms/${user.roleAssociation.value}/sessions`,
        rubrics: `/api/events/${user.event}/rooms/${user.roleAssociation.value}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
