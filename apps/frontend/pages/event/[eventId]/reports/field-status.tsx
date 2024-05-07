import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import {
  Event,
  Team,
  SafeUser,
  EventState,
  RobotGameMatch,
  RoleTypes,
  JudgingSession,
  RobotGameTable
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Countdown from '../../../../components/general/countdown';
import FieldQueueReport from '../../../../components/queueing/field-queue-report';
import ActiveMatch from '../../../../components/field/scorekeeper/active-match';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { useTime } from '../../../../hooks/use-time';

interface MatchStatusTimerProps {
  activeMatch: WithId<RobotGameMatch> | null;
  loadedMatch: WithId<RobotGameMatch> | null;
  teams: Array<WithId<Team>>;
}

const MatchStatusTimer: React.FC<MatchStatusTimerProps> = ({ activeMatch, loadedMatch, teams }) => {
  const currentTime = useTime({ interval: 1000 });
  const twoMinutes = 2 * 60;

  const getCountdownTarget = (startTime: Date) => dayjs(startTime).toDate();

  const getStatus = useMemo<'ahead' | 'close' | 'behind' | 'done'>(() => {
    if (loadedMatch) {
      if (dayjs(loadedMatch.scheduledTime) > currentTime) {
        return dayjs(loadedMatch.scheduledTime).diff(currentTime, 'seconds') > twoMinutes
          ? 'ahead'
          : 'close';
      }
      return 'behind';
    }
    return 'done';
  }, [loadedMatch, currentTime, twoMinutes]);

  const progressToNextMatchStart = useMemo(() => {
    if (loadedMatch) {
      const diff = dayjs(loadedMatch.scheduledTime).diff(currentTime, 'seconds');
      return (Math.abs(Math.min(twoMinutes, diff)) / twoMinutes) * 100;
    }
    return 0;
  }, [currentTime, twoMinutes, loadedMatch]);

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
        {loadedMatch && (
          <Stack spacing={2}>
            {loadedMatch?.scheduledTime && (
              <Countdown
                allowNegativeValues={true}
                targetDate={getCountdownTarget(loadedMatch.scheduledTime)}
                variant="h1"
                fontFamily={'Roboto Mono'}
                fontSize="10rem"
                fontWeight={700}
                dir="ltr"
              />
            )}
            <Typography variant="h4">
              {loadedMatch.participants.filter(p => p.teamId).filter(p => !!p.ready).length} מתוך{' '}
              {loadedMatch.participants.filter(p => p.teamId).length} שולחנות מוכנים
            </Typography>
          </Stack>
        )}
      </Paper>
      {getStatus !== 'done' && (
        <LinearProgress
          color={getStatus === 'ahead' ? 'success' : getStatus === 'close' ? 'warning' : 'error'}
          variant="determinate"
          value={progressToNextMatchStart}
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

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Event>;
  divisionState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  sessions: Array<WithId<JudgingSession>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialEventState,
  teams: initialTeams,
  matches: initialMatches,
  tables,
  sessions: initialSessions
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [sessions, setSessions] = useState<Array<WithId<JudgingSession>>>(initialSessions);
  const [divisionState, setEventState] = useState<WithId<EventState>>(initialEventState);

  const activeMatch = useMemo(
    () => matches.find(m => m._id === divisionState.activeMatch) || null,
    [matches, divisionState.activeMatch]
  );
  const loadedMatch = useMemo(
    () => matches.find(m => m._id === divisionState.loadedMatch) || null,
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

  const handleMatchEvent = (match: WithId<RobotGameMatch>, newEventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  const handleSessionEvent = (
    session: WithId<JudgingSession>,
    newEventState?: WithId<EventState>
  ) => {
    setSessions(sessions =>
      sessions.map(s => {
        if (s._id === session._id) {
          return session;
        }
        return s;
      })
    );

    if (newEventState) setEventState(newEventState);
  };

  const { connectionStatus } = useWebsocket(
    division._id.toString(),
    ['field', 'pit-admin', 'judging'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent },
      { name: 'judgingSessionStarted', handler: handleSessionEvent },
      { name: 'judgingSessionCompleted', handler: handleSessionEvent },
      { name: 'judgingSessionAborted', handler: handleSessionEvent },
      { name: 'judgingSessionUpdated', handler: handleSessionEvent }
    ]
  );

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/division/${division._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout
        maxWidth="lg"
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מצב הזירה | ${division.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/division/${division._id}/reports`}
        backDisabled={connectionStatus === 'connecting'}
        color={division.color}
      >
        <MatchStatusTimer activeMatch={activeMatch} loadedMatch={loadedMatch} teams={teams} />
        <Stack direction="row" spacing={2} my={4}>
          <ActiveMatch title="מקצה רץ" match={activeMatch} startTime={activeMatch?.startTime} />
          <ActiveMatch title="המקצה הבא" match={loadedMatch} sessions={sessions} />
        </Stack>
        <FieldQueueReport
          divisionId={division._id}
          matches={matches.filter(m => m._id.toString() !== loadedMatch?._id.toString())}
          sessions={sessions}
          tables={tables}
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
        division: `/api/divisions/${user.divisionId}`,
        divisionState: `/api/divisions/${user.divisionId}/state`,
        teams: `/api/divisions/${user.divisionId}/teams`,
        matches: `/api/divisions/${user.divisionId}/matches`,
        tables: `/api/divisions/${user.divisionId}/tables`,
        sessions: `/api/divisions/${user.divisionId}/sessions`
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
