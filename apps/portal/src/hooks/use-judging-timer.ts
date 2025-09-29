import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { blue, green, purple } from '@mui/material/colors';
import useCountdown from './use-countdown';

interface JudgingStage {
  duration: number;
  primaryText: string;
  iconColor: string;
  id: number;
  secondaryText?: string;
}

interface TimedJudgingStage extends JudgingStage {
  startTime: Date;
  endTime: Date;
}

const JUDGING_SESSION_LENGTH = 28 * 60; // 28 minutes in seconds

export const useJudgingTimer = () => {
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

    const elapsedSeconds = secondsJudging;
    let cumulativeTime = 0;

    for (const stage of timedStages) {
      if (elapsedSeconds >= cumulativeTime && elapsedSeconds < cumulativeTime + stage.duration) {
        return stage;
      }
      cumulativeTime += stage.duration;
    }
    return timedStages[timedStages.length - 1];
  }, [timedStages, isRunning, secondsJudging, startTime]);

  const stagesToDisplay = useMemo(() => {
    if (!currentStage) return timedStages.slice(0, 4);
    if (currentStage.id === 0) return timedStages.slice(0, 4);
    return timedStages.slice(currentStage.id - 1, currentStage.id + 3);
  }, [currentStage, timedStages]);

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

  return {
    isRunning,
    isPaused,
    sessionEnd,
    secondsJudging,
    currentStage,
    stagesToDisplay,
    handleStart,
    handlePause,
    handleStop
  };
};
