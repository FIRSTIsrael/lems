import { useMemo, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { Paper, Typography } from '@mui/material';
import { Event, SafeUser, EventState, RobotGameMatch, RoleTypes, MATCH_LENGTH } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Countdown from '../../../../components/general/countdown';
import Layout from '../../../../components/layout';
import FlippedLinearProgress from '../../../../components/general/flipped-linear-progress';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { useTime } from '../../../../hooks/use-time';

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
  const currentTime = useTime({ interval: 100 });
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [eventState, setEventState] = useState<WithId<EventState>>(initialEventState);

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

  const getCountdownTarget = (startTime: Date) =>
    dayjs(startTime).add(MATCH_LENGTH, 'seconds').toDate();

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

  const { connectionStatus } = useWebsocket(event._id.toString(), ['field'], undefined, [
    {
      name: 'matchStarted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-start.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-abort.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchEndgame',
      handler: match => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-endgame.wav').play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores')
          new Audio('/assets/sounds/field/field-end.wav').play();
        handleMatchEvent(newMatch, newEventState);
      }
    }
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
              targetDate={getCountdownTarget(activeMatch?.startTime)}
              expiredText="00:00"
              fontFamily="Roboto Mono"
              fontSize="15rem"
              fontWeight={700}
              textAlign="center"
            />
          )}
        </Paper>
        {activeMatch?.startTime && (
          <FlippedLinearProgress
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
        event: `/api/events/${user.eventId}`,
        eventState: `/api/events/${user.eventId}/state`,
        matches: `/api/events/${user.eventId}/matches`
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
