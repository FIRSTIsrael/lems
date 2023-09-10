import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import { Event, Team, JudgingRoom, JudgingSession, SafeUser } from '@lems/types';
import { ensureArray } from '@lems/utils';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import RubricStatusReferences from '../../../components/display/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/display/judging/judging-room-schedule';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/display/welcome-header';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizeRole } from '../../../lib/utils/localization';
import { judgingSocket } from '../../../lib/utils/websocket';
import JudgingTimer from '../../../components/display/judging/judging-timer';

interface Props {
  user: SafeUser;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
  room: WithId<JudgingRoom>;
}

const Page: NextPage<Props> = ({ user, event, teams, room }) => {
  const router = useRouter();
  const [isJudging, setIsJudging] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(judgingSocket.connected);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);

  useEffect(() => {
    judgingSocket.connect();

    apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setIsJudging(!!data.find((s: WithId<JudgingSession>) => s.status === 'in-progress'));
        setSessions(data);
      });

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onSessionStarted = (sessionId: string, time: Date) => {
      apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
        .then(res => res?.json())
        .then(data => setSessions(data));
      setIsJudging(true);
    };

    const onSessionAborted = (sessionId: string) => {
      apiFetch(`/api/events/${user.event}/rooms/${room._id}/sessions`)
        .then(res => res?.json())
        .then(data => setSessions(data));
      setIsJudging(false);
    };

    judgingSocket.on('connect', onConnect);
    judgingSocket.on('disconnect', onDisconnect);
    judgingSocket.on('sessionStarted', onSessionStarted);
    judgingSocket.on('sessionAborted', onSessionAborted);

    return () => {
      judgingSocket.off('connect', onConnect);
      judgingSocket.off('disconnect', onDisconnect);
      judgingSocket.off('sessionStarted', onSessionStarted);
      judgingSocket.off('sessionAborted', onSessionAborted);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <RoleAuthorizer user={user} allowedRoles="judge" onFail={() => router.back()}>
      <Layout
        maxWidth={700}
        title={`ממשק ${user.role && localizeRole(user.role).name} | ${event.name}`}
        error={!isConnected}
        action={<ConnectionIndicator status={isConnected} />}
      >
        {isJudging ? (
          <JudgingTimer session={} team={undefined} /> //TODO: make timer page, have time page set the state back to false when timer is done
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
                rooms={ensureArray(room)}
                teams={teams}
                user={user}
                socket={judgingSocket}
              />
            </Paper>
          </>
        )}
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
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
};

export default Page;
