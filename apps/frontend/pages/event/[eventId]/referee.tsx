import { useState, useMemo, useCallback } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import { Avatar, Box, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';
import JudgingRoomIcon from '@mui/icons-material/Workspaces';
import {
  Event,
  Team,
  JudgingSession,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import RubricStatusReferences from '../../../components/judging/rubric-status-references';
import JudgingRoomSchedule from '../../../components/judging/judging-room-schedule';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import WelcomeHeader from '../../../components/general/welcome-header';
import JudgingTimer from '../../../components/judging/judging-timer';
import AbortJudgingSessionButton from '../../../components/judging/abort-judging-session-button';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeTeam } from '../../../localization/teams';
import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';

interface ReadyCheckProps {
  team: Team;
  match: WithId<RobotGameMatch>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({ team, match, socket }) => {
  const handleReadyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      match &&
        socket.emit('changeMatchStatus', match._id.toString(), e.target.checked, response => {
          // { ok: true }
        });
    },
    [match, socket]
  );

  return (
    <Paper sx={{ mt: 4, p: 4 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h1">{localizeTeam(team)}</Typography>
        <Typography variant="h3" fontSize="2rem" color="gray">
          המקצה הבא יתחיל בשעה {dayjs(match.time).format('HH:mm')}
        </Typography>
        <FormControlLabel
          control={<Checkbox checked={match.ready} onChange={handleReadyChange} />}
          label={<Typography variant="h4">הקבוצה ואנחנו מוכנים למקצה!</Typography>}
          sx={{ '& .MuiSvgIcon-root': { fontSize: 35 } }}
        />
      </Stack>
    </Paper>
  );
};

type RefereePageStatus = 'timer' | 'readyCheck' | 'scoring' | undefined;

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
}

const Page: NextPage<Props> = ({ user, event, table }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [team, setTeam] = useState<WithId<Team> | undefined>(undefined);
  const [scoresheet, setScoresheet] = useState<WithId<Scoresheet> | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);

  const pageState: RefereePageStatus = useMemo(() => {
    const fetchTeam = (teamId: ObjectId | undefined) => {
      teamId &&
        apiFetch(`/api/events/${user.event}/teams/${teamId}`)
          .then(res => res.json())
          .then(team => setTeam(team));
    };

    const fetchScoresheet = (matchId: ObjectId | undefined) => {
      matchId &&
        apiFetch(`/api/events/${user.event}/tables/${table._id}/matches/${matchId}/scoresheet`)
          .then(res => res.json())
          .then(data => setScoresheet(data));
    };

    if (eventState && matches) {
      const activeMatch = matches.find(match => match.number === eventState.activeMatch);
      if (activeMatch) {
        setMatch(activeMatch);
        if (activeMatch.status === 'in-progress') return 'timer';
        else {
          apiFetch(
            `/api/events/${user.event}/tables/${table._id}/matches/${activeMatch._id}/scoresheet`
          )
            .then(res => res.json())
            .then((data: WithId<Scoresheet>) => {
              if (data.status === 'completed') {
                const nextMatch = matches.find(match => match.number > eventState.activeMatch);
                setMatch(nextMatch);
                fetchTeam(nextMatch?.team);
                return 'readyCheck';
              } else {
                fetchTeam(activeMatch.team);
                setScoresheet(data);
                return 'scoring';
              }
            });
        }
      } else {
        const previousMatchIndex =
          matches.findIndex(match => match.number > eventState.activeMatch) - 1;
        if (previousMatchIndex >= 0) {
          const previousMatch = matches[previousMatchIndex];
          setMatch(previousMatch);
          fetchScoresheet(previousMatch._id);
          fetchTeam(previousMatch.team);
          return 'scoring';
        } else {
          setMatch(matches[0]);
          fetchScoresheet(matches[0]._id);
          fetchTeam(matches[0].team);
          return 'readyCheck';
        }
      }
    }
  }, [user, table, matches, eventState]);

  const updateEventState = () => {
    apiFetch(`/api/events/${user.event}/state`)
      .then(res => res?.json())
      .then(data => setEventState(data));
  };

  const updateMatches = () => {
    return apiFetch(`/api/events/${user.event}/tables/${table._id}/matches`)
      .then(res => res?.json())
      .then(data => setMatches(data));
  };

  const getData = () => {
    updateEventState();
    updateMatches();
  };
  // const onSessionStarted = (sessionId: string) => {
  //   updateSessions().then(newSessions => {
  //     const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
  //     setActiveSession(s?.status === 'in-progress' ? s : undefined);
  //   });
  // };

  // const onSessionCompleted = (sessionId: string) => {
  //   updateSessions().then(newSessions => {
  //     const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
  //     if (s?.status === 'completed') setActiveSession(undefined);
  //   });
  // };

  // const onSessionAborted = (sessionId: string) => {
  //   updateSessions().then(newSessions => {
  //     const s = newSessions.find((s: WithId<JudgingSession>) => s._id.toString() === sessionId);
  //     if (s?.status === 'not-started') setActiveSession(undefined);
  //   });
  // };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    getData,
    [
      { name: 'matchStarted', handler: getData },
      { name: 'matchCompleted', handler: getData },
      { name: 'matchAborted', handler: getData },
      { name: 'teamRegistered', handler: getData },
      { name: 'scoresheetUpdated', handler: getData },
      { name: 'matchStatusChanged', handler: updateMatches }
    ]
  );

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {team && match && scoresheet && pageState === 'readyCheck' && (
          <ReadyCheck team={team} match={match} socket={socket} />
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
    const tablePromise = apiFetch(
      `/api/events/${user.event}/tables/${user.roleAssociation.value}`,
      undefined,
      ctx
    ).then(res => res?.json());
    const [table, event] = await Promise.all([tablePromise, eventPromise]);

    return { props: { user, event, table } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
