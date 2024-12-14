import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import {
  DivisionWithEvent,
  Team,
  JudgingRoom,
  JudgingSession,
  SafeUser,
  DivisionState,
  RoleTypes,
  JUDGING_SESSION_LENGTH,
  RobotGameMatch
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import StatusIcon from '../../../components/general/status-icon';
import Layout from '../../../components/layout';
import StyledTeamTooltip from '../../../components/general/styled-team-tooltip';
import JudgingStatusTimer from '../../../components/judging/judging-status-timer';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeDivisionTitle } from '../../../localization/event';

interface JudgingStatusTableProps {
  currentSessions: Array<WithId<JudgingSession>>;
  nextSessions: Array<WithId<JudgingSession>>;
  activeMatch?: WithId<RobotGameMatch>;
  loadedMatch?: WithId<RobotGameMatch>;
  matches?: Array<WithId<RobotGameMatch>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTable: React.FC<JudgingStatusTableProps> = ({
  currentSessions,
  nextSessions,
  activeMatch,
  loadedMatch,
  matches = [],
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
                        {session.status === 'not-started' && session.queued ? (
                          <Tooltip title="הקבוצה בקיו" arrow>
                            <PeopleAltRoundedIcon />
                          </Tooltip>
                        ) : (
                          <StatusIcon status={session.status} />
                        )}
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
                const teamOnField =
                  !!activeMatch?.participants.find(p => p.teamId === team?._id) ||
                  !!loadedMatch?.participants.find(p => p.teamId === team?._id) ||
                  !!matches
                    .filter(m => m.called && m.status === 'not-started')
                    .some(m => m.participants.some(p => p.teamId === team?._id && p.queued));
                return (
                  session && (
                    <TableCell key={session._id.toString()} align="center">
                      <Stack
                        spacing={2}
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {team && <StyledTeamTooltip team={team} />}
                        {team?.registered && teamOnField && (
                          <Tooltip title="הקבוצה נמצאת בזירה כרגע!" arrow>
                            <WarningAmberRoundedIcon color="warning" />
                          </Tooltip>
                        )}
                        {session.status === 'not-started' && session.queued && (
                          <Tooltip title="הקבוצה בקיו" arrow>
                            <PeopleAltRoundedIcon />
                          </Tooltip>
                        )}
                      </Stack>
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
  division: WithId<DivisionWithEvent>;
  divisionState: WithId<DivisionState>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  rooms,
  teams: initialTeams,
  sessions: initialSessions,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);

  const activeMatch = useMemo(
    () => matches.find(m => m._id === divisionState.activeMatch),
    [matches, divisionState.activeMatch]
  );
  const loadedMatch = useMemo(
    () => matches.find(m => m._id === divisionState.loadedMatch),
    [matches, divisionState.loadedMatch]
  );

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

  const { connectionStatus } = useWebsocket(
    division._id.toString(),
    ['judging', 'pit-admin', 'field'],
    undefined,
    [
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent },
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent }
    ]
  );

  const currentSessions = useMemo(
    () => sessions.filter(session => session.number === divisionState.currentSession),
    [sessions, divisionState]
  );

  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === divisionState.currentSession + 1),
    [sessions, divisionState]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מצב השיפוט | ${localizeDivisionTitle(division)}`}
        connectionStatus={connectionStatus}
        user={user}
        division={division}
        back={`/lems/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <JudgingStatusTimer
          teams={teams}
          currentSessions={currentSessions}
          nextSessions={nextSessions}
        />
        <JudgingStatusTable
          currentSessions={currentSessions}
          nextSessions={nextSessions}
          activeMatch={activeMatch}
          loadedMatch={loadedMatch}
          matches={matches}
          rooms={rooms}
          teams={teams}
        />
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
        divisionState: `/api/divisions/${divisionId}/state`,
        teams: `/api/divisions/${divisionId}/teams`,
        rooms: `/api/divisions/${divisionId}/rooms`,
        sessions: `/api/divisions/${divisionId}/sessions`,
        matches: `/api/divisions/${divisionId}/matches`
      },
      ctx
    );

    return { props: { user, ...data } };
  } catch {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
