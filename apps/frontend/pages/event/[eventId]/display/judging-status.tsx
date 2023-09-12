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
  JUDGING_SESSION_LENGTH
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import StatusIcon from '../../../../components/display/status-icon';
import Countdown from '../../../../components/display/countdown';
import Layout from '../../../../components/layout';
import { apiFetch } from '../../../../lib/utils/fetch';
import { localizeRole } from '../../../../lib/utils/localization';
import { useWebsocket } from '../../../../hooks/use-websocket';

interface JudgingStatusTimerProps {
  activeSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTimer: React.FC<JudgingStatusTimerProps> = ({
  activeSessions,
  nextSessions,
  teams
}) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => {
      clearInterval(interval);
    };
  });

  const ahead = useMemo(
    () => nextSessions.length > 0 && dayjs(nextSessions[0].time) > currentTime,
    [currentTime, nextSessions]
  );

  const progressToNextSessionStart = useMemo(
    () =>
      activeSessions.length > 0 && nextSessions.length > 0
        ? (dayjs(nextSessions[0].time).diff(currentTime) * 100) /
          dayjs(activeSessions[0].time).diff(dayjs(nextSessions[0].time))
        : 0,
    [currentTime, activeSessions, nextSessions]
  );

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
              targetDate={dayjs(nextSessions[0].time).toDate()}
              variant="h1"
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
          )}
          {activeSessions.length > 0 && (
            <Typography variant="h4">
              {activeSessions.filter(session => !!session.start).length} מתוך{' '}
              {
                activeSessions.filter(
                  session => teams.find(team => team._id === session.team)?.registered
                ).length
              }{' '}
              קבוצות בחדר השיפוט
            </Typography>
          )}
        </Stack>
      </Paper>
      {activeSessions.length > 0 && nextSessions.length > 0 && (
        <LinearProgress
          color={ahead ? 'success' : 'error'}
          variant="determinate"
          value={Math.min(Math.abs(progressToNextSessionStart), 100)}
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
  activeSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTable: React.FC<JudgingStatusTableProps> = ({
  activeSessions,
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
                {room.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activeSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב נוכחי:
                <br />
                {dayjs(activeSessions[0].time).format('HH:mm')}
              </TableCell>
              {activeSessions.map(session => (
                <TableCell key={session._id.toString()} align="center">
                  <Box alignItems="center">
                    {teams.find(t => t._id === session.team)?.name}
                    <br />
                    <StatusIcon status={session.status} />
                    <br />
                    {session.start &&
                      `סיום: ${dayjs(session.start)
                        .add(JUDGING_SESSION_LENGTH, 'seconds')
                        .format('HH:mm')}`}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          )}
          {nextSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב הבא:
                <br />
                {dayjs(nextSessions[0].time).format('HH:mm')}
              </TableCell>
              {nextSessions.map(session => (
                <TableCell key={session._id.toString()} align="center">
                  {teams.find(t => t._id === session.team)?.name}
                </TableCell>
              ))}
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
  rooms: Array<WithId<JudgingRoom>>;
}

const Page: NextPage<Props> = ({ user, event, rooms }) => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>([]);
  const [teams, setTeams] = useState<Array<WithId<Team>>>([]);
  const [eventState, setEventState] = useState<WithId<EventState>>({} as WithId<EventState>);

  const updateSessions = () => {
    apiFetch(`/api/events/${user.event}/sessions`)
      .then(res => res?.json())
      .then(data => {
        setSessions(data);
      });
  };

  const updateTeams = () => {
    apiFetch(`/api/events/${user.event}/teams`)
      .then(res => res?.json())
      .then(data => {
        setTeams(data);
      });
  };

  const updateEventState = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => {
        setEventState(data);
      });
  };

  const updateData = () => {
    updateSessions();
    updateTeams();
    updateEventState();
  };

  const onSessionUpdate = () => {
    updateSessions();
    updateEventState();
  };

  const { connectionStatus } = useWebsocket(
    event._id.toString(),
    ['judging', 'pit-admin'],
    updateData,
    [
      { name: 'judgingSessionStarted', handler: onSessionUpdate },
      { name: 'judgingSessionCompleted', handler: onSessionUpdate },
      { name: 'judgingSessionAborted', handler: onSessionUpdate },
      { name: 'teamRegistered', handler: updateTeams }
    ]
  );

  const activeSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.activeSession),
    [sessions, eventState]
  );

  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.activeSession + 1),
    [sessions, eventState]
  );

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
        back={`/event/${event._id}/display`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <JudgingStatusTimer
          teams={teams}
          activeSessions={activeSessions}
          nextSessions={nextSessions}
        />
        <JudgingStatusTable
          activeSessions={activeSessions}
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

    const eventPromise = apiFetch(`/api/events/${user.event}`, undefined, ctx).then(res =>
      res?.json()
    );

    const roomsPromise = apiFetch(`/api/events/${user.event}/rooms`, undefined, ctx).then(res =>
      res?.json()
    );
    const [rooms, event] = await Promise.all([roomsPromise, eventPromise]);

    return { props: { user, event, rooms } };
  } catch (err) {
    console.log(err);
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
