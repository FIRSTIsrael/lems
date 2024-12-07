import { useMemo, useRef, useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { LinearProgress, Paper, Typography } from '@mui/material';
import {
  Division,
  SafeUser,
  DivisionState,
  RobotGameMatch,
  RoleTypes,
  MATCH_LENGTH
} from '@lems/types';
import { RoleAuthorizer } from '../../../components/role-authorizer';
import Countdown from '../../../components/general/countdown';
import Layout from '../../../components/layout';
import { getUserAndDivision, serverSideGetRequests } from '../../../lib/utils/fetch';
import { useWebsocket } from '../../../hooks/use-websocket';
import { useTime } from '../../../hooks/use-time';
import Grid from '@mui/material/Grid2';
import Image from 'next/image';

interface Props {
  user: WithId<SafeUser>;
  division: WithId<Division>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const Page: NextPage<Props> = ({
  user,
  division,
  divisionState: initialDivisionState,
  matches: initialMatches
}) => {
  const router = useRouter();
  const currentTime = useTime({ interval: 100 });
  const [matches, setMatches] = useState<Array<WithId<RobotGameMatch>>>(initialMatches);
  const [divisionState, setDivisionState] = useState<WithId<DivisionState>>(initialDivisionState);

  const sounds = useRef({
    start: new Audio('/assets/sounds/field/field-start.wav'),
    abort: new Audio('/assets/sounds/field/field-abort.wav'),
    endgame: new Audio('/assets/sounds/field/field-endgame.wav'),
    end: new Audio('/assets/sounds/field/field-end.wav')
  });

  const activeMatch = useMemo(
    () => matches.find(m => m._id === divisionState.activeMatch),
    [matches, divisionState.activeMatch]
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

  const { connectionStatus } = useWebsocket(division._id.toString(), ['field'], undefined, [
    {
      name: 'matchStarted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.start.play();
        handleMatchEvent(newMatch, newDivisionState);
      }
    },
    {
      name: 'matchAborted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.abort.play();
        handleMatchEvent(newMatch, newDivisionState);
      }
    },
    {
      name: 'matchEndgame',
      handler: match => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.endgame.play();
      }
    },
    {
      name: 'matchCompleted',
      handler: (newMatch, newDivisionState) => {
        if (divisionState.audienceDisplay.screen === 'scores') sounds.current.end.play();
        handleMatchEvent(newMatch, newDivisionState);
      }
    }
  ]);

  return (
    <RoleAuthorizer
      user={user}
      allowedRoles={[...RoleTypes]}
      onFail={() => {
        router.push(`/lems/${user.role}`);
        enqueueSnackbar('לא נמצאו הרשאות מתאימות.', { variant: 'error' });
      }}
    >
      <Layout maxWidth="xl" error={connectionStatus === 'disconnected'}>
        <Paper sx={{ p: 2, mt: 'calc(50vh - 302px)' }}>
          <Grid container direction="row">
            <Grid position="relative" size={2}>
              <Image
                fill
                style={{ objectFit: 'contain', padding: 16 }}
                src="/assets/audience-display/first-israel-horizontal.svg"
                alt="לוגו של FIRST ישראל"
              />
            </Grid>
            <Grid size={8}>
              <Typography fontSize="7.5rem" fontWeight={700} textAlign="center">
                {activeMatch?.number
                  ? `מקצה #${activeMatch?.number}`
                  : activeMatch?.stage === 'test'
                    ? 'מקצה בדיקה'
                    : 'אין מקצה פעיל'}
              </Typography>
            </Grid>
            <Grid position="relative" size={2}>
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
    const { user, divisionId } = await getUserAndDivision(ctx);

    const data = await serverSideGetRequests(
      {
        division: `/api/divisions/${divisionId}`,
        divisionState: `/api/divisions/${divisionId}/state`,
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
