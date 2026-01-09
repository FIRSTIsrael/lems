'use client';

import dayjs from 'dayjs';
import { useEffect, useRef, useMemo } from 'react';
import { useCountdown } from '../../../../../../../../../lib/time/hooks/use-countdown';
import { useJudgingSounds } from '@lems/shared';

// Judging stages with durations in seconds
export const JUDGING_STAGES = [
  { id: 'setup', duration: 240 }, // 4 min - Welcome
  { id: 'innovation-presentation', duration: 300 }, // 5 min
  { id: 'innovation-questions', duration: 300 }, // 5 min
  { id: 'robot-presentation', duration: 300 }, // 5 min
  { id: 'robot-questions', duration: 300 }, // 5 min
  { id: 'final-thoughts', duration: 360 } // 6 min
];

export interface JudgingSessionTimerState {
  currentStageIndex: number;
  stageTimeRemaining: number;
  totalTimeRemaining: number;
}

export const useJudgingSessionTimer = (startTime: string, sessionLength: number) => {
  const [, , minutes, seconds] = useCountdown(
    dayjs(startTime).add(sessionLength, 'second').toDate()
  );

  const { currentStageIndex, stageTimeRemaining } = useMemo(() => {
    let result: { currentStageIndex: number; stageTimeRemaining: number } = {
      currentStageIndex: JUDGING_STAGES.length - 1,
      stageTimeRemaining: 0
    };

    let elapsedTime = sessionLength - (minutes * 60 + seconds);

    for (let i = 0; i < JUDGING_STAGES.length; i++) {
      if (elapsedTime >= JUDGING_STAGES[i].duration) {
        elapsedTime -= JUDGING_STAGES[i].duration;
        continue;
      }

      // Only reached if in current stage, return current stage info
      // This uses a "break" statement to get around react compiler quirk
      // where if a memo returns an object it can only have one return statement
      result = {
        currentStageIndex: i,
        stageTimeRemaining: JUDGING_STAGES[i].duration - elapsedTime
      };
      break;
    }

    return result;
  }, [minutes, seconds, sessionLength]);

  const { playSound } = useJudgingSounds();
  const previousStageRef = useRef(currentStageIndex);

  // Calculate total time remaining (current stage + all remaining stages)
  const totalTimeRemaining = useMemo(() => minutes * 60 + seconds, [minutes, seconds]);

  // Play sound and handle state transitions
  useEffect(() => {
    if (currentStageIndex !== previousStageRef.current) {
      if (previousStageRef.current !== 0) {
        playSound('change');
      }
      previousStageRef.current = currentStageIndex;
    }
  }, [currentStageIndex, playSound]);

  return {
    timerState: {
      currentStageIndex,
      stageTimeRemaining,
      totalTimeRemaining
    }
  };
};

/**
 * Format seconds to MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get stage color based on stage id
 */
export const getStageColor = (stageId: string): string => {
  if (stageId === 'setup' || stageId === 'final-thoughts') {
    return '#9c27b0'; // purple
  }
  if (stageId.includes('innovation')) {
    return '#2196f3'; // blue
  }
  if (stageId.includes('robot')) {
    return '#4caf50'; // green
  }
  return '#757575'; // grey
};
