import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import { LinearProgress, Paper, Stack, Typography } from '@mui/material';
import {
  Event,
  Team,
  SafeUser,
  EventState,
  RobotGameMatch,
  RoleTypes,
  RobotGameTable
} from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Countdown from '../../../../components/general/countdown';
import ActiveMatch from '../../../../components/field/scorekeeper/active-match';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface MatchStatusTimerProps {
  activeMatch: WithId<RobotGameMatch> | undefined;
  loadedMatch: WithId<RobotGameMatch> | undefined;
  teams: Array<WithId<Team>>;
}

const MatchStatusTimer: React.FC<MatchStatusTimerProps> = ({ activeMatch, loadedMatch, teams }) => {
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const twoMinutes = 2 * 60;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => {
      clearInterval(interval);
    };
  });

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
        <Stack spacing={2}>
          {loadedMatch && (
            <Countdown
              allowNegativeValues={true}
              targetDate={dayjs(loadedMatch.scheduledTime).toDate()}
              variant="h1"
              fontFamily={'Roboto Mono'}
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
          )}
          {loadedMatch && (
            <Typography variant="h4">
              {loadedMatch.participants.filter(p => !!p.ready).length} מתוך{' '}
              {
                loadedMatch.participants.filter(
                  p => teams.find(team => team._id === p.teamId)?.registered
                ).length
              }{' '}
              שולחנות מוכנים
            </Typography>
          )}
        </Stack>
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
  event: WithId<Event>;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  tables: Array<WithId<RobotGameTable>>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  teams: initialTeams,
  tables,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [teams, setTeams] = useState<Array<WithId<Team>>>(initialTeams);
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);

  const activeMatch = useMemo(
    () => matches.find(m => m._id === eventState.activeMatch),
    [matches, eventState.activeMatch]
  );
  const loadedMatch = useMemo(
    () => matches.find(m => m._id === eventState.loadedMatch),
    [matches, eventState.loadedMatch]
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

  const handleMatchEvent = (match: WithId<RobotGameMatch>, eventState?: WithId<EventState>) => {
    setMatches(matches =>
      matches.map(m => {
        if (m._id === match._id) {
          return match;
        }
        return m;
      })
    );

    if (eventState) setEventState(eventState);
  };

  const { connectionStatus } = useWebsocket(
    event._id.toString(),
    ['field', 'pit-admin'],
    undefined,
    [
      { name: 'teamRegistered', handler: handleTeamRegistered },
      { name: 'matchLoaded', handler: handleMatchEvent },
      { name: 'matchStarted', handler: handleMatchEvent },
      { name: 'matchAborted', handler: handleMatchEvent },
      { name: 'matchCompleted', handler: handleMatchEvent },
      { name: 'matchUpdated', handler: handleMatchEvent }
    ]
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
        title={`ממשק ${user.role && localizedRoles[user.role].name} - מצב הזירה | ${event.name}`}
        error={connectionStatus === 'disconnected'}
        action={<ConnectionIndicator status={connectionStatus} />}
        back={`/event/${event._id}/reports`}
        backDisabled={connectionStatus !== 'connecting'}
      >
        <MatchStatusTimer activeMatch={activeMatch} loadedMatch={loadedMatch} teams={teams} />
        <Stack direction="row" spacing={2} my={4}>
          <ActiveMatch
            title="מקצה רץ"
            match={
              matches?.find(match => match._id === eventState.activeMatch) ||
              ({} as WithId<RobotGameMatch>)
            }
            startTime={matches?.find(match => match._id === eventState.activeMatch)?.startTime}
          />
          <ActiveMatch
            title="המקצה הבא"
            match={
              matches?.find(match => match._id === eventState.loadedMatch) ||
              ({} as WithId<RobotGameMatch>)
            }
          />
        </Stack>
      </Layout>
    </RoleAuthorizer>
  );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const user = await apiFetch(`/api/me`, undefined, ctx).then(res => res?.json());

    const data = await serverSideGetRequests(
      {
        event: `/api/events/${user.event}`,
        eventState: `/api/events/${user.event}/state`,
        teams: `/api/events/${user.event}/teams`,
        tables: `/api/events/${user.event}/tables`,
        matches: `/api/events/${user.event}/matches`
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
