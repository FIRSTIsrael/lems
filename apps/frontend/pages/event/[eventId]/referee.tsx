import { useState, useMemo, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import dayjs, { Dayjs } from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  Event,
  Team,
  SafeUser,
  Scoresheet,
  RobotGameMatch,
  RobotGameTable,
  EventState,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  MATCH_LENGTH
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import ConnectionIndicator from '../../../components/connection-indicator';
import Layout from '../../../components/layout';
import Countdown from '../../../components/general/countdown';
import { apiFetch } from '../../../lib/utils/fetch';
import { localizedRoles } from '../../../localization/roles';
import { useWebsocket } from '../../../hooks/use-websocket';
import { localizeTeam } from '../../../localization/teams';
import { enqueueSnackbar } from 'notistack';

interface ReadyCheckProps {
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  team: WithId<Team>;
  match: WithId<RobotGameMatch>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({ event, table, team, match, socket }) => {
  const handleReadyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    match &&
      socket.emit(
        'updateMatch',
        event._id.toString(),
        table._id.toString(),
        match._id.toString(),
        { ready: e.target.checked },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון הסטטוס נכשל.', { variant: 'error' });
          }
        }
      );
  };
  const handleStart = () => {
    match &&
      socket.emit(
        'startMatch',
        event._id.toString(),
        table._id.toString(),
        match._id.toString(),
        response => {
          // { ok: true }
        }
      );
  };

  return (
    <Paper sx={{ transform: 'translateY(100%)', mt: 4, p: 4 }}>
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
        <Button onClick={handleStart}>Click me!</Button>
      </Stack>
    </Paper>
  );
};

interface TimerProps {
  team: Team;
  match: WithId<RobotGameMatch>;
}

const Timer: React.FC<TimerProps> = ({ team, match }) => {
  const matchEnd = dayjs(match.start).add(MATCH_LENGTH, 'seconds');
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 100);
    return () => {
      clearInterval(interval);
    };
  });

  const percentLeft = useMemo(
    () => matchEnd.diff(currentTime) / (10 * MATCH_LENGTH),
    [currentTime, matchEnd]
  );

  return (
    match.start && (
      <Box sx={{ transform: 'translateY(100%)' }}>
        <Paper sx={{ mt: 4, py: 4, px: 2, textAlign: 'center' }}>
          <Countdown
            targetDate={matchEnd.toDate()}
            expiredText="00:00"
            variant="h1"
            fontSize="10rem"
            fontWeight={700}
            dir="ltr"
          />
          <Typography variant="h4" fontSize="1.5rem" fontWeight={400} gutterBottom>
            {localizeTeam(team)}
          </Typography>
        </Paper>
        <LinearProgress
          variant="determinate"
          value={percentLeft}
          color={percentLeft <= 20 ? 'error' : 'primary'}
          sx={{
            height: 16,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            mt: -2
          }}
        />
      </Box>
    )
  );
};

const DonePaper = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        transform: 'translateY(100%)',
        boxShadow:
          '0 0, -15px 0 30px -10px #ff66017e, 0 0 30px -10px #c4007952, 15px 0 30px -10px #2b01d447',
        mt: 4,
        p: 4
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Image
          src="/assets/emojis/party-popper.png"
          alt="אימוג׳י של קונפטי"
          height={42}
          width={42}
        />
        <Typography variant="h4" sx={{ mb: 2 }}>
          סיימתם את המקצים של השולחן שלכם!
        </Typography>
        <Typography fontSize="1.15rem" color="#666">
          אנו מודים לכם שהתנדבתם איתנו היום ועל התמיכה במשימתנו. ביחד, אנו מעצימים את הדור הבא של
          מנהיגי המדע והטכנולוגיה ובונים עולם טוב יותר.
        </Typography>
        <Typography fontSize="1rem" color="#666">
          זה זמן טוב להחזיר את הטאבלט לטעינה ולחזור לחדר המתנדבים.
        </Typography>
      </Stack>
    </Paper>
  );
};

type RefereePageStatus = 'timer' | 'ready-check' | 'done' | undefined;

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  teams: Array<WithId<Team>>;
}

const Page: NextPage<Props> = ({ user, event, table, teams }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);
  const [team, setTeam] = useState<WithId<Team> | undefined>(undefined);
  const [pageState, setPageState] = useState<RefereePageStatus>(undefined);

  useEffect(() => {
    const getScoresheet = (matchId: ObjectId) => {
      return apiFetch(
        `/api/event/${user.event}/tables/${table._id}/matches/${matchId}/scoresheet`
      ).then(res => res.json());
    };

    if (eventState && matches) {
      const handleScoringLogic = (_match: WithId<RobotGameMatch>) => {
        getScoresheet(_match._id).then((scoresheet: WithId<Scoresheet>) => {
          if (scoresheet.status === 'not-started' || scoresheet.status === 'in-progress') {
            router.push(`/events/${user.event}/team/${_match.team}/scoresheet/${scoresheet._id}`);
          } else {
            const nextMatch = matches.find(m => m.number > eventState.activeMatch);
            if (nextMatch) {
              setMatch(nextMatch);
              setTeam(teams.find(t => t._id === nextMatch.team));
              setPageState('ready-check');
              return;
            }
            setMatch(undefined);
            setTeam(undefined);
            setPageState('done');
            return;
          }
        });
      };

      const activeMatch = matches.find(m => m.number === eventState.activeMatch);
      if (activeMatch) {
        if (activeMatch.status === 'in-progress') {
          setMatch(activeMatch);
          setTeam(teams.find(t => t._id === activeMatch.team));
          setPageState('timer');
          return;
        }
        handleScoringLogic(activeMatch);
        return;
      } else {
        const previousMatch = matches.find(m => m.number < eventState.activeMatch);
        if (previousMatch) {
          handleScoringLogic(previousMatch);
          return;
        } else {
          const firstMatch = matches.reduce((prev, curr) =>
            prev.number < curr.number ? prev : curr
          );
          setMatch(firstMatch);
          setTeam(teams.find(t => t._id === firstMatch.team));
          setPageState('ready-check');
          return;
        }
      }
    }
  }, [eventState, matches, teams, router, table._id, user.event]);

  const getEventState = () => {
    apiFetch(`/api/events/${user.event}/state/`)
      .then(res => res.json())
      .then(data => {
        setEventState(data);
      });
  };

  const getMatches = () => {
    apiFetch(`/api/events/${user.event}/tables/${table._id}/matches`)
      .then(res => res.json())
      .then(data => {
        setMatches(data);
      });
  };

  const onMatchStarted = (tableId: string, matchId: string) => {
    getEventState();
    if (tableId === table._id.toString()) getMatches();
  };

  const onMatchUpdate = (tableId: string, matchId: string) => {
    if (tableId === table._id.toString()) getMatches();
  };

  const getData = () => {
    getEventState();
    getMatches();
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    getData,
    [
      { name: 'matchStarted', handler: onMatchStarted },
      { name: 'matchCompleted', handler: onMatchUpdate },
      { name: 'matchAborted', handler: onMatchUpdate },
      { name: 'matchUpdated', handler: onMatchUpdate }
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
        {team && match && pageState === 'ready-check' && (
          <ReadyCheck event={event} table={table} team={team} match={match} socket={socket} />
        )}
        {team && match && pageState === 'timer' && <Timer team={team} match={match} />}
        {pageState === 'done' && <DonePaper />}
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

    const teamsPromise = apiFetch(`/api/events/${user.event}/teams`, undefined, ctx).then(res =>
      res?.json()
    );

    const [table, event, teams] = await Promise.all([tablePromise, eventPromise, teamsPromise]);

    return { props: { user, event, table, teams } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
