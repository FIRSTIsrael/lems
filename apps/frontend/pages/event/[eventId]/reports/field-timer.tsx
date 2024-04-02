import { useMemo, useRef, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { LinearProgress, Paper, Typography } from '@mui/material';
import { Event, SafeUser, EventState, RobotGameMatch, RoleTypes, MATCH_LENGTH } from '@lems/types';
import { RoleAuthorizer } from '../../../../components/role-authorizer';
import Countdown from '../../../../components/general/countdown';
import Layout from '../../../../components/layout';
import { apiFetch, serverSideGetRequests } from '../../../../lib/utils/fetch';
import { useWebsocket } from '../../../../hooks/use-websocket';
import { useTime } from '../../../../hooks/use-time';
import Grid from '@mui/material/Unstable_Grid2';
import Image from 'next/image';

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

  const sounds = useRef({
    start: new Audio('/assets/sounds/field/field-start.wav'),
    abort: new Audio('/assets/sounds/field/field-abort.wav'),
    endgame: new Audio('/assets/sounds/field/field-endgame.wav'),
    end: new Audio('/assets/sounds/field/field-end.wav')
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
        if (eventState.audienceDisplay.screen === 'scores') sounds.current.start.play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores') sounds.current.abort.play();
        handleMatchEvent(newMatch, newEventState);
      }
    },
    {
      name: 'matchEndgame',
      handler: match => {
        if (eventState.audienceDisplay.screen === 'scores') sounds.current.endgame.play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newEventState) => {
        if (eventState.audienceDisplay.screen === 'scores') sounds.current.end.play();
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
          <Grid container direction="row">
            <Grid xs={2} position="relative">
              <Image
                fill
                style={{ objectFit: 'contain', padding: 16 }}
                src="/assets/audience-display/first-israel-horizontal.svg"
                alt="לוגו של FIRST ישראל"
              />
            </Grid>
            <Grid xs={8}>
              <Typography fontSize="7.5rem" fontWeight={700} textAlign="center">
                {activeMatch?.number
                  ? `מקצה #${activeMatch?.number}`
                  : activeMatch?.stage === 'test'
                    ? 'מקצה בדיקה'
                    : 'אין מקצה פעיל'}
              </Typography>
            </Grid>
            <Grid xs={2} position="relative">
              <Image
                fill
                style={{ objectFit: 'contain', padding: 8 }}
                src="/assets/audience-display/technion-horizontal.svg"
                alt="לוגו של הטכניון"
              />
            </Grid>
          </Grid>
          <Countdown
            targetDate={
              activeMatch?.startTime ? getCountdownTarget(activeMatch?.startTime) : new Date(0)
            }
            expiredText="00:00"
            fontFamily="Roboto Mono"
            fontSize="15rem"
            fontWeight={700}
            textAlign="center"
          />
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
