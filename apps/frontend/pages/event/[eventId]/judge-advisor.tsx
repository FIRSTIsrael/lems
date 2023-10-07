import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import { WithId } from 'mongodb';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Event,
  EventState,
  Team,
  JudgingCategory,
  Rubric
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import { apiFetch } from '../../../lib/utils/fetch';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/general/welcome-header';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  rooms,
  teams: initialTeams,
  sessions: initialSessions,
  rubrics: initialRubrics
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [rubrics, setRubrics] = useState<Array<WithId<Rubric<JudgingCategory>>>>(initialRubrics);

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
        } else {
          return t;
        }
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
    <RoleAuthorizer user={user} allowedRoles="judge-advisor" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <>
          <WelcomeHeader event={event} user={user} />
          <Paper sx={{ borderRadius: 2, mb: 4, boxShadow: 2, p: 2 }}>
            <RubricStatusReferences />
          </Paper>
          {rooms.map(room => (
            <Paper key={room._id.toString()} sx={{ borderRadius: 3, mb: 4, boxShadow: 2 }}>
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
                sessions={sessions.filter(s => s.room === room._id)}
                event={event}
                room={room}
                teams={teams}
                user={user}
                socket={socket}
                rubrics={rubrics}
              />
            </Paper>
          ))}
        </>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );
    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );

    const sessionsPromise = apiFetch(`/api/events/${user.event}/sessions`, undefined, ctx).then(
      res => res?.json()
    );

    const rubricsPromise = apiFetch(`/api/events/${user.event}/rubrics`, undefined, ctx).then(res =>
      res?.json()
    );

    const [rooms, event, teams, sessions, rubrics] = await Promise.all([
      roomsPromise,
      eventPromise,
      teamsPromise,
      sessionsPromise,
      rubricsPromise
    ]);

    return { props: { user, event, rooms, teams, sessions, rubrics } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
