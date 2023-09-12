import { useState, useMemo } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser } from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import RubricStatusReferences from '../../../components/display/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/display/judging/judging-room-schedule';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/display/welcome-header';
import JudgingTimer from '../../../components/display/judging/judging-timer';
import AbortJudgingSessionButton from '../../../components/input/abort-judging-session-button';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizeRole } from '../../../lib/utils/localization';
import { useWebsocket } from '../../../hooks/use-websocket';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
}

const Page: NextPage<Props> = ({ user, event, room }) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);
  const [activeSession, setActiveSession] = useState<WithId<JudgingSession> | undefined>(undefined);

  const updateSessions = () => {
    return apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
        return data;
      });
  };

  const updateTeams = () => {
    return apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  const getInitialData = () => {
    updateTeams().then(() => {
      updateSessions().then(data =>
        setActiveSession(data.find((s: WithId<JudgingSession>) => s.status === 'in-progress'))
      );
    });
  };

  const onSessionStarted = (sessionId: string) => {
    updateSessions().then(newSessions => {
      const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
      setActiveSession(s?.status === 'in-progress' ? s : undefined);
    });
  };

  const onSessionCompleted = (sessionId: string) => {
    updateSessions().then(newSessions => {
      const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
      if (s?.status === 'completed') setActiveSession(undefined);
    });
  };

  const onSessionAborted = (sessionId: string) => {
    updateSessions().then(newSessions => {
      const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
      if (s?.status === 'not-started') setActiveSession(undefined);
    });
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging'],
    getInitialData,
    [
      { name: 'judgingSessionStarted', handler: onSessionStarted },
      { name: 'judgingSessionCompleted', handler: onSessionCompleted },
      { name: 'judgingSessionAborted', handler: onSessionAborted }
    ]
  );

  const activeTeam = useMemo(() => {
    return activeSession
      ? teams.find((t: WithId<Team>) => t._id == activeSession.team) || ({} as WithId<Team>)
      : ({} as WithId<Team>);
  }, [teams, activeSession]);

  return (
    <RoleAuthorizer user={user} allowedRoles="judge" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizeRole(user.role).name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {activeSession && activeTeam ? (
          <>
            <JudgingTimer session={activeSession} team={activeTeam} />
            <Box display="flex" justifyContent="center">
              <AbortJudgingSessionButton
                event={event}
                room={room}
                session={activeSession}
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

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );
    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );
    const roomPromise = apiFetch(
      `/api/events/${user.event}/rooms/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());
    const [teams, room, event] = await Promise.all([teamsPromise, roomPromise, eventPromise]);

    return { props: { user, event, teams, room } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
