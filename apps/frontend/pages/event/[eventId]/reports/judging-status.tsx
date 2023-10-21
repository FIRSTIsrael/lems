import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import {
  Box,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Event,
  Team,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  EventState,
  RoleTypes,
  JUDGING_SESSION_LENGTH
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import StatusIcon from '../../../../components/general/status-icon';
import Countdown from '../../../../components/general/countdown';
import Layout from '../../../../components/layout';
import StyledTeamTooltip from '../../../../components/general/styled-team-tooltip';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface JudgingStatusTimerProps {
  currentSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTimer: React.FC<JudgingStatusTimerProps> = ({
  currentSessions,
  nextSessions,
  teams
}) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const fiveMinutes = 5 * 60;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => {
      clearInterval(interval);
    };
  });

  const getStatus = useMemo<'ahead' | 'close' | 'behind' | 'done'>(() => {
    if (nextSessions.length > 0) {
      if (dayjs(nextSessions[0].scheduledTime) > currentTime) {
        return dayjs(nextSessions[0].scheduledTime).diff(currentTime, 'seconds') > fiveMinutes
          ? 'ahead'
          : 'close';
      }
      return 'behind';
    }
    return 'done';
  }, [currentTime, fiveMinutes, nextSessions]);

  const progressToNextSessionStart = useMemo(() => {
    if (nextSessions.length > 0) {
      const diff = dayjs(nextSessions[0].scheduledTime).diff(currentTime, 'seconds');
      return (Math.abs(Math.min(fiveMinutes, diff)) / fiveMinutes) * 100;
    }
    return 0;
  }, [currentTime, fiveMinutes, nextSessions]);

  return (
    <>
      <Paper
        sx={{
          py: 4,
          px: 2,
          textAlign: 'center',
          mt: 4
        }}
      >
        <Stack spacing={2}>
          {nextSessions.length > 0 && (
            <Countdown
              allowNegativeValues={true}
              targetDate={dayjs(nextSessions[0].scheduledTime).toDate()}
              variant="h1"
              fontFamily={'Roboto Mono'}
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
          )}
          {currentSessions.filter(s => s.status === 'in-progress').length > 0 && (
            <Typography variant="h4">
              {currentSessions.filter(session => !!session.startTime).length} מתוך{' '}
              {
                currentSessions.filter(
                  session => teams.find(team => team._id === session.teamId)?.registered
                ).length
              }{' '}
              קבוצות בחדר השיפוט
            </Typography>
          )}
        </Stack>
      </Paper>
      {getStatus !== 'done' && (
        <LinearProgress
          color={getStatus === 'ahead' ? 'success' : getStatus === 'close' ? 'warning' : 'error'}
          variant="determinate"
          value={progressToNextSessionStart}
          sx={{
            height: 16,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            mt: -2
          }}
        />
      )}
    </>
  );
};

interface JudgingStatusTableProps {
  currentSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTable: React.FC<JudgingStatusTableProps> = ({
  currentSessions,
  nextSessions,
  rooms,
  teams
}) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {rooms.map(room => (
              <TableCell key={room._id.toString()} align="center">
                חדר {room.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {currentSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב נוכחי:
                <br />
                {dayjs(currentSessions[0].scheduledTime).format('HH:mm')}
              </TableCell>
              {rooms.map(room => {
                const session = currentSessions.find(s => s.roomId === room._id);
                const team = teams.find(t => t._id === session?.teamId);
                return (
                  session && (
                    <TableCell key={session._id.toString()} align="center">
                      <Box alignItems="center">
                        {team && <StyledTeamTooltip team={team} />}
                        <br />
                        <StatusIcon status={session.status} />
                        <br />
                        {session.startTime &&
                          `סיום: ${dayjs(session.startTime)
                            .add(JUDGING_SESSION_LENGTH, 'seconds')
                            .format('HH:mm')}`}
                      </Box>
                    </TableCell>
                  )
                );
              })}
            </TableRow>
          )}
          {nextSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב הבא:
                <br />
                {dayjs(nextSessions[0].scheduledTime).format('HH:mm')}
              </TableCell>
              {rooms.map(room => {
                const session = nextSessions.find(s => s.roomId === room._id);
                const team = teams.find(t => t._id === session?.teamId);
                return (
                  session && (
                    <TableCell key={session._id.toString()} align="center">
                      {team && <StyledTeamTooltip team={team} />}
                    </TableCell>
                  )
                );
              })}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  rooms,
  teams: initialTeams,
  sessions: initialSessions
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);

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

  const handleSessionEvent = (session: WithId<JudgingSession>, eventState?: WithId<EventState>) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );

    if (eventState) setEventState(eventState);
  };

  const { connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered }
    ]
  );

  const currentSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.currentSession),
    [sessions, eventState]
  );

  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.currentSession + 1),
    [sessions, eventState]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="md"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מצב השיפוט | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <JudgingStatusTimer
          teams={teams}
          currentSessions={currentSessions}
          nextSessions={nextSessions}
        />
        <JudgingStatusTable
          currentSessions={currentSessions}
          nextSessions={nextSessions}
          rooms={rooms}
          teams={teams}
        />
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
        sessions: `/api/events/${user.eventId}/sessions`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
