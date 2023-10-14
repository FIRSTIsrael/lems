import { useEffect, useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs, { Dayjs } from 'dayjs';
import { WithId } from 'mongodb';
import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { Event, SafeUser, EventState, RobotGameMatch, RoleTypes, MATCH_LENGTH } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import ConnectionIndicator from '../../../../components/connection-indicator';
import Countdown from '../../../../components/general/countdown';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { localizedRoles } from '../../../../localization/roles';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { enqueueSnackbar } from 'notistack';

interface Props {
  user: WithId<SafeUser>;
  event: WithId<Event>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  event,
  eventState: initialEventState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(dayjs()), 100);
    return () => {
      clearInterval(interval);
    };
  });

  const activeMatch = useMemo(
    () => matches.find(m => m._id === eventState.activeMatch),
    [matches, eventState.activeMatch]
  );

  const matchEnd = useMemo(
    () => dayjs(activeMatch?.startTime).add(MATCH_LENGTH, 'seconds'),
    [activeMatch?.startTime]
  );

  const percentLeft = useMemo(
    () => matchEnd.diff(currentTime) / (10 * MATCH_LENGTH),
    [currentTime, matchEnd]
  );

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

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    { name: 'matchStarted', handler: handleMatchEvent },
    { name: 'matchAborted', handler: handleMatchEvent },
    { name: 'matchCompleted', handler: handleMatchEvent }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/event/${event._id}/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout maxWidth="xl" error={connectionStatus === 'disconnected'}>
        <Paper sx={{ p: 2, mt: 'calc(50vh - 302px)' }}>
          <Typography fontSize="7.5rem" fontWeight={700} textAlign="center">
            {activeMatch?.number
              ? `מקצה #${activeMatch?.number}`
              : activeMatch?.stage === 'test'
              ? 'מקצה בדיקה'
              : '-'}
          </Typography>
          {activeMatch?.startTime && (
            <Countdown
              targetDate={dayjs(activeMatch.startTime).add(MATCH_LENGTH, 'seconds').toDate()}
              expiredText="00:00"
              fontFamily="Roboto Mono"
              fontSize="15rem"
              fontWeight={700}
              textAlign="center"
            />
          )}
        </Paper>
        {activeMatch?.startTime && (
          <LinearProgress
            variant="determinate"
            value={percentLeft}
            color={percentLeft <= 20 ? 'error' : 'primary'}
            sx={{
              height: 48,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
              mt: -2
            }}
          />
        )}
        {/* </Box> */}
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
