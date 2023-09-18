import { useState, useMemo, useCallback, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { ObjectId, WithId } from 'mongodb';
import {
  Box,
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
import dayjs, { Dayjs } from 'dayjs';
import { Socket } from 'socket.io-client';
import { redirect } from 'next/navigation';
import Image from 'next/image';

interface ReadyCheckProps {
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
  team: WithId<Team>;
  match: WithId<RobotGameMatch>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ReadyCheck: React.FC<ReadyCheckProps> = ({ event, table, team, match, socket }) => {
  const handleReadyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      match &&
        socket.emit(
          'updateMatch',
          event._id.toString(),
          table._id.toString(),
          match._id.toString(),
          { ready: e.target.checked },
          response => {
            // { ok: true }
          }
        );
    },
    [event._id, match, socket, table._id]
  );

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

type RefereePageStatus = 'timer' | 'readyCheck' | 'done' | undefined;

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  table: WithId<RobotGameTable>;
}

const Page: NextPage<Props> = ({ user, event, table }) => {
  const router = useRouter();
  const [eventState, setEventState] = useState<EventState | undefined>(undefined);
  const [team, setTeam] = useState<WithId<Team> | undefined>(undefined);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>> | undefined>(undefined);
  const [match, setMatch] = useState<WithId<RobotGameMatch> | undefined>(undefined);

  const onMatchUpdate = (tableId: string) => {
    // this should also get a team :D
    return;
  };

  const onScoresheetUpdate = (tableId: string, scoresheetId: string) => {
    return;
  };

  const getData = () => {
    return;
  };

  const { socket, connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    getData,
    [
      { name: 'matchStarted', handler: (tableId: string) => onMatchUpdate(tableId) },
      { name: 'matchCompleted', handler: (tableId: string) => onMatchUpdate(tableId) },
      { name: 'matchAborted', handler: (tableId: string) => onMatchUpdate(tableId) },
      { name: 'matchUpdated', handler: (tableId: string) => onMatchUpdate(tableId) },
      {
        name: 'scoresheetStatusChanged',
        handler: (tableId: string, scoresheetId: string) =>
          onScoresheetUpdate(tableId, scoresheetId)
      }
    ]
  );

  //TODO
  const pageState: RefereePageStatus = useMemo(() => {
    return 'done' as RefereePageStatus;
  }, []);

  return (
    <RoleAuthorizer user={user} allowedRoles="referee" onFail={() => router.back()}>
      <Layout
        maxWidth={800}
        title={`ממשק ${user.role && localizedRoles[user.role].name} | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
      >
        {team && match && pageState === 'readyCheck' && (
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
    const eventStatePromise = apiFetch(`/api/events/${user.event}/state`, undefined, ctx).then(
      res => res?.json()
    );
    const [table, event, eventState] = await Promise.all([
      tablePromise,
      eventPromise,
      eventStatePromise
    ]);

    const matches: Array<WithId<RobotGameMatch>> = await apiFetch(
      `/api/events/${user.event}/tables/${table._id}/matches`,
      undefined,
      ctx
    ).then(res => res?.json());

    const activeMatch = matches.find(
      match => match.number === eventState.activeMatch && match.status === 'completed'
    );
    if (activeMatch) {
      const scoresheet: WithId<Scoresheet> = await apiFetch(
        `/api/events/${user.event}/tables/${table._id}/matches/${activeMatch._id}/scoresheet`
      ).then(res => res?.json());
      if (scoresheet.status !== 'completed')
        return {
          redirect: {
            destination: `/event/${user.event}/team/${activeMatch.team}/scoresheet/${scoresheet._id}/`,
            permanent: false
          }
        };
    }

    return { props: { user, event, table } };
  } catch (err) {
    return { redirect: { destination: '/login', permanent: false } };
  }
};

export default Page;
