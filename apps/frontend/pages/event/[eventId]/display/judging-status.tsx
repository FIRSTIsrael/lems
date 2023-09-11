import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser, ConnectionStatus } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import RubricStatusReferences from '../../../../components/display/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../../components/display/judging/judging-room-schedule';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Layout from '../../../../components/layout';
import WelcomeHeader from '../../../../components/display/welcome-header';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizeRole } from '../../../../lib/utils/localization';
import { judgingSocket } from '../../../../lib/utils/websocket';
import Countdown from '../../../../components/display/countdown';
import JudgingTimer from '../../../../components/display/judging/judging-timer';

interface StatusCardProps {
  session: WithId<JudgingSession>;
  team: WithId<Team>;
}

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  room: WithId<JudgingRoom>;
}

const Page: NextPage<Props> = ({ user, event, teams, room }) => {
  const router = useRouter();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    judgingSocket.connected ? 'connected' : 'disconnected'
  );
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);

  const updateSessions = (): Promise<Array<WithId<JudgingSession>>> => {
    return apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
        return data;
      });
  };

  useEffect(() => {
    judgingSocket.connect();
    setConnectionStatus('connecting');

    apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
      });

    const onConnect = () => {
      setConnectionStatus('connected');
    };

    const onDisconnect = () => {
      setConnectionStatus('disconnected');
    };

    judgingSocket.on('connect', onConnect);
    judgingSocket.on('disconnect', onDisconnect);
    judgingSocket.on('sessionStarted', updateSessions);
    judgingSocket.on('sessionCompleted', updateSessions);
    judgingSocket.on('sessionAborted', updateSessions);

    return () => {
      judgingSocket.off('connect', onConnect);
      judgingSocket.off('disconnect', onDisconnect);
      judgingSocket.off('sessionStarted', updateSessions);
      judgingSocket.off('sessionCompleted', updateSessions);
      judgingSocket.off('sessionAborted', updateSessions);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={['display', 'head-referee']}
      onFail={() => router.back()}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizeRole(user.role).name} - מצב השיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        <>
          {sessions &&
            sessions.map(session => (
              <JudgingTimer
                key={session._id.toString()}
                session={session}
                team={
                  teams.find((t: WithId<Team>) => t._id == session.team) || ({} as WithId<Team>)
                }
              />
            ))}
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
              socket={judgingSocket}
            />
          </Paper>
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
    const roomPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );
    const [teams, room, event] = await Promise.all([teamsPromise, roomPromise, eventPromise]);

    return { props: { user, event, teams, room } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
