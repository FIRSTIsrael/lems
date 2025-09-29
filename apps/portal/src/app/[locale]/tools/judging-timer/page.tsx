'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'motion/react';
import { Typography, Paper, LinearProgress, Stack, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { blue, green, purple } from '@mui/material/colors';
import { PlayArrow, Stop, Pause } from '@mui/icons-material';
import Countdown from '../../../../components/countdown';
import JudgingStageBox from '../../../../components/judging-stage-box';
import useCountdown from '../../../../hooks/use-countdown';

type JudgingStage = {
  duration: number;
  primaryText: string;
  iconColor: string;
  id: number;
  secondaryText?: string;
};

type TimedJudgingStage = JudgingStage & { startTime: Date; endTime: Date };

const JUDGING_SESSION_LENGTH = 28 * 60; // 28 minutes in seconds
// Force gradient refresh - updated background and translations

const JudgingTimerPage: React.FC = () => {
  const t = useTranslations('pages.tools.judging-timer');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const STAGES: Array<JudgingStage> = useMemo(
    () => [
      { duration: 2 * 60, primaryText: t('stages.welcome'), iconColor: purple[400], id: 0 },
      {
        duration: 5 * 60,
        primaryText: t('stages.innovation-project'),
        secondaryText: t('stages.presentation'),
        iconColor: blue[400],
        id: 1
      },
      {
        duration: 5 * 60,
        primaryText: t('stages.innovation-project'),
        secondaryText: t('stages.questions-answers'),
        iconColor: blue[400],
        id: 2
      },
      {
        duration: 5 * 60,
        primaryText: t('stages.robot-design'),
        secondaryText: t('stages.robot-explanation'),
        iconColor: green[400],
        id: 3
      },
      {
        duration: 5 * 60,
        primaryText: t('stages.robot-design'),
        secondaryText: t('stages.questions-answers'),
        iconColor: green[400],
        id: 4
      },
      { duration: 6 * 60, primaryText: t('stages.core-values'), iconColor: purple[400], id: 5 }
    ],
    [t]
  );

  const timedStages: Array<TimedJudgingStage> = useMemo(() => {
    if (!startTime) return [];

    return STAGES.reduce((acc, stage) => {
      if (stage.id === 0)
        return [
          {
            startTime: startTime,
            endTime: dayjs(startTime).add(stage.duration, 'seconds').toDate(),
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
    }, [] as Array<TimedJudgingStage>);
  }, [startTime, STAGES]);

  const sessionEnd = startTime ? dayjs(startTime).add(JUDGING_SESSION_LENGTH, 'seconds') : null;
  const [, , minutes, seconds] = useCountdown(sessionEnd?.toDate() || new Date());

  const secondsJudging: number = useMemo(() => {
    return JUDGING_SESSION_LENGTH - (minutes * 60 + seconds);
  }, [minutes, seconds]);

  const currentStage = useMemo(() => {
    if (!isRunning || timedStages.length === 0 || !startTime) return null;
    
    // Calculate elapsed time since start
    const elapsedSeconds = secondsJudging;
    let cumulativeTime = 0;
    
    // Find which stage we're currently in based on elapsed time
    for (const stage of timedStages) {
      if (elapsedSeconds >= cumulativeTime && elapsedSeconds < cumulativeTime + stage.duration) {
        return stage;
      }
      cumulativeTime += stage.duration;
    }
    
    // If we've passed all stages, return the last one
    return timedStages[timedStages.length - 1];
  }, [timedStages, isRunning, secondsJudging, startTime]);

  const stagesToDisplay = useMemo(() => {
    if (!currentStage) return timedStages.slice(0, 4);
    if (currentStage.id === 0) return timedStages.slice(0, 4);
    return timedStages.slice(currentStage.id - 1, currentStage.id + 3);
  }, [currentStage, timedStages]);

  const barProgress = useMemo(() => {
    return 100 - (secondsJudging / JUDGING_SESSION_LENGTH) * 100;
  }, [secondsJudging]);

  const handleStart = () => {
    setStartTime(new Date());
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setStartTime(null);
  };

  const STAGE_HEIGHT = 105;

  if (!isRunning) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)'
        }}
      >
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            maxWidth: 500,
            width: '90%'
          }}
        >
          <Typography variant="h3" gutterBottom fontWeight={600}>
            {t('title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 6 }}>
            {t('subtitle')}
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={handleStart}
            sx={{ px: 6, py: 3, fontSize: '1.2rem' }}
          >
            {t('start-session')}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)'
      }}
    >
      <Grid container width="80%" alignItems="flex-top" columnSpacing={4}>
        <Grid size={4}>
          <Stack spacing={3} height={STAGE_HEIGHT * 4}>
            <AnimatePresence>
              {stagesToDisplay.map(stage => (
                <motion.div
                  key={stage.id}
                  variants={{
                    enter: {
                      opacity: 0,
                      y: 50,
                      height: 0
                    },
                    move: { opacity: 1, y: 0, height: STAGE_HEIGHT },
                    leave: { opacity: 0, y: -50, height: 0 }
                  }}
                  initial="enter"
                  exit="leave"
                  animate="move"
                  transition={{ duration: 0.4 }}
                  style={{ borderRadius: '16px' }}
                >
                  <JudgingStageBox
                    primaryText={stage.primaryText}
                    secondaryText={stage.secondaryText}
                    iconColor={stage.iconColor}
                    stageDuration={stage.duration}
                    targetDate={stage.id === currentStage?.id ? stage.endTime : undefined}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
              targetDate={sessionEnd?.toDate() || new Date()}
              expiredText="00:00"
              variant="h1"
              fontFamily="Roboto Mono"
              fontSize="10rem"
              fontWeight={700}
              dir="ltr"
            />
            <Typography
              variant="body1"
              fontSize="1.5rem"
              fontWeight={600}
              sx={{ color: '#666' }}
              gutterBottom
            >
              {t('session-ends-at')} {sessionEnd?.format('HH:mm')}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={barProgress}
              color={barProgress !== 0 ? 'primary' : 'error'}
              sx={{ width: '80%', borderRadius: 32, height: 16 }}
            />

            <Stack direction="row" spacing={2} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                color={isPaused ? 'primary' : 'warning'}
                startIcon={isPaused ? <PlayArrow /> : <Pause />}
                onClick={handlePause}
                sx={{ width: 120 }}
              >
                {isPaused ? t('resume') : t('pause')}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Stop />}
                onClick={handleStop}
                sx={{ width: 120 }}
              >
                {t('stop')}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JudgingTimerPage;
