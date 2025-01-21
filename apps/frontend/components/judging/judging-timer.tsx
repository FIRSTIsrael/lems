import { useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { animated, useTransition } from 'react-spring';
import { Typography, Paper, LinearProgress, Stack, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { blue, green, purple } from '@mui/material/colors';
import {
  Division,
  JUDGING_SESSION_LENGTH,
  JudgingRoom,
  JudgingSession,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import useCountdown from '../../hooks/use-countdown';
import Countdown from '../general/countdown';
import { localizeTeam } from '../../localization/teams';
import JudgingStageBox from './judging-stage-box';
import AbortJudgingSessionButton from './abort-judging-session-button';

type JudgingStage = {
  duration: number;
  primaryText: string;
  iconColor: string;
  id: number;
  secondaryText?: string;
};

type TimedJudgingStage = JudgingStage & { startTime: Date; endTime: Date };

interface JudgingTimerProps {
  division: WithId<Division>;
  room: WithId<JudgingRoom>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  session: WithId<JudgingSession>;
  team: WithId<Team>;
}

const JudgingTimer: React.FC<JudgingTimerProps> = ({ division, room, socket, session, team }) => {
  const STAGES: Array<JudgingStage> = [
    { duration: 2 * 60, primaryText: 'קבלת פנים', iconColor: purple[400], id: 0 },
    {
      duration: 5 * 60,
      primaryText: 'פרויקט החדשנות',
      secondaryText: 'הצגת הפרויקט',
      iconColor: blue[400],
      id: 1
    },
    {
      duration: 5 * 60,
      primaryText: 'פרויקט החדשנות',
      secondaryText: 'שאלות ותשובות',
      iconColor: blue[400],
      id: 2
    },
    {
      duration: 5 * 60,
      primaryText: 'תכנון הרובוט',
      secondaryText: 'הסבר על הרובוט',
      iconColor: green[400],
      id: 3
    },
    {
      duration: 5 * 60,
      primaryText: 'תכנון הרובוט',
      secondaryText: 'שאלות ותשובות',
      iconColor: green[400],
      id: 4
    },
    { duration: 6 * 60, primaryText: 'שיתוף מסכם', iconColor: purple[400], id: 5 }
  ];

  const timedStages: Array<TimedJudgingStage> = useMemo(
    () =>
      STAGES.reduce((acc, stage) => {
        if (stage.id === 0 && session.startTime)
          return [
            {
              startTime: session.startTime,
              endTime: dayjs(session.startTime).add(stage.duration, 'seconds').toDate(),
              ...stage
            }
          ];
        else
          return [
            ...acc,
            {
              startTime: acc[acc.length - 1].endTime,
              endTime: dayjs(acc[acc.length - 1].endTime)
                .add(stage.duration, 'seconds')
                .toDate(),
              ...stage
            }
          ];
      }, [] as Array<TimedJudgingStage>),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const sessionEnd = dayjs(session.startTime).add(JUDGING_SESSION_LENGTH, 'seconds');
  const [, , minutes, seconds] = useCountdown(sessionEnd.toDate());

  const secondsJudging: number = useMemo(() => {
    return JUDGING_SESSION_LENGTH - (minutes * 60 + seconds);
  }, [minutes, seconds]);

  const currentStage = useMemo(() => {
    const currentTime = dayjs();
    const _currentStage = timedStages.find(stage =>
      currentTime.isBetween(stage.startTime, stage.endTime, 'seconds', '[]')
    );

    return _currentStage ? _currentStage : timedStages[STAGES.length - 1];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsJudging]);

  const stagesToDisplay = useMemo(() => {
    if (currentStage.id === 0) return timedStages.slice(0, 4);
    return timedStages.slice(currentStage.id - 1, currentStage.id + 3);
  }, [currentStage.id, timedStages]);

  const barProgress = useMemo(() => {
    return 100 - (secondsJudging / JUDGING_SESSION_LENGTH) * 100;
  }, [secondsJudging]);

  useEffect(() => {
    if (secondsJudging === JUDGING_SESSION_LENGTH) {
      new Audio('/assets/sounds/judging/judging-end.wav').play();
    }
  }, [secondsJudging]);

  useEffect(() => {
    if (currentStage.id !== 0) new Audio('/assets/sounds/judging/judging-change.wav').play();
  }, [currentStage]);

  const transitions = useTransition(stagesToDisplay, {
    keys: stage => stage.id,
    from: {
      opacity: 0,
      innerHeight: 0,
      transform: 'translateY(50px)',
      borderRadius: '16px'
    },
    enter: stage => ({
      opacity: 1,
      innerHeight: 105,
      transform: 'translateY(0px)'
    }),
    leave: {
      opacity: 0,
      innerHeight: 0,
      transform: 'translateY(-50px)'
    },
    config: { duration: 400 }
  });

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Grid container width="80%" alignItems="flex-top" columnSpacing={4}>
        <Grid size={4}>
          <Stack spacing={3}>
            {transitions(({ innerHeight, ...style }, stage) => (
              <animated.div
                style={{ ...style, height: innerHeight, backgroundColor: 'transparent' }}
              >
                <JudgingStageBox
                  key={stage.id}
                  primaryText={stage.primaryText}
                  secondaryText={stage.secondaryText}
                  iconColor={stage.iconColor}
                  stageDuration={stage.duration}
                  targetDate={stage.id === currentStage.id ? stage.endTime : undefined}
                />
              </animated.div>
            ))}
          </Stack>
        </Grid>
        <Grid size={8}>
          <Stack
            component={Paper}
            spacing={2}
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center'
            }}
            alignItems="center"
          >
            <Countdown
              targetDate={sessionEnd.toDate()}
              expiredText="00:00"
              variant="h1"
              fontFamily="Roboto Mono"
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
            <Typography variant="h4" fontSize="3rem" fontWeight={400} gutterBottom>
              {localizeTeam(team)}
            </Typography>
            <Typography
              variant="body1"
              fontSize="1.5rem"
              fontWeight={600}
              sx={{ color: '#666' }}
              gutterBottom
            >
              מפגש השיפוט יסתיים בשעה {sessionEnd.format('HH:mm')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={barProgress}
              color={barProgress !== 0 ? 'primary' : 'error'}
              sx={{ width: '80%', borderRadius: 32, height: 16 }}
            />
            <AbortJudgingSessionButton
              division={division}
              room={room}
              session={session}
              socket={socket}
              sx={{ mt: 2.5, width: 200 }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JudgingTimer;
