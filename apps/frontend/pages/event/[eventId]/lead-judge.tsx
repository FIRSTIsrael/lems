import { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { WithId } from 'mongodb';
import { Avatar, Box, Paper, Typography, Stack } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  Event,
  EventState,
  Team,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  Rubric,
  JudgingCategory
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import ReportLink from '../../../components/general/report-link';
import InsightsLink from '../../../components/general/insights-link';
import WelcomeHeader from '../../../components/general/welcome-header';
import { apiFetch, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState,
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

  const handleLeadJudgeCalled = (room: JudgingRoom) => {
    enqueueSnackbar(`חדר ${room.name} צריך עזרה!`, {
      variant: 'warning',
      persist: true
    });
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'rubricStatusChanged', handler: updateRubric },
      { name: 'leadJudgeCalled', handler: handleLeadJudgeCalled }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles="lead-judge"
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={
          <Stack direction="row" spacing={2}>
            <ConnectionIndicator status={connectionStatus} />
            {eventState.completed ? <InsightsLink event={event} /> : <ReportLink event={event} />}
          </Stack>
        }
        color={event.color}
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
                sessions={sessions.filter(s => s.roomId === room._id)}
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

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        teams: `/api/events/${user.eventId}/teams`,
        rooms: `/api/events/${user.eventId}/rooms`,
        sessions: `/api/events/${user.eventId}/sessions`,
        rubrics: `/api/events/${user.eventId}/rubrics`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
