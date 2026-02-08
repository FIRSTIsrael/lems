'use client';

import dayjs from 'dayjs';
import { useEffect, useRef, useMemo } from 'react';
import { useJudgingSounds } from '@lems/shared';
import { useCountdown } from '../../../../../../../../../lib/time/hooks/use-countdown';

// Judging stages with durations in seconds
export const JUDGING_STAGES = [
  { id: 'setup', duration: 120 }, // 2 min - Welcome
  { id: 'innovation-presentation', duration: 300 }, // 5 min
  { id: 'innovation-questions', duration: 300 }, // 5 min
  { id: 'robot-presentation', duration: 300 }, // 5 min
  { id: 'robot-questions', duration: 300 } // 5 min
  // Additional final-thoughts stage added dynamically based on session length
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

  const adjustedStages = useMemo(() => {
    const fixedStageDuration = JUDGING_STAGES.reduce((sum, stage) => sum + stage.duration, 0);

    const finalThoughtsDuration = Math.max(0, sessionLength - fixedStageDuration);

    return [...JUDGING_STAGES, { id: 'final-thoughts', duration: finalThoughtsDuration }];
  }, [sessionLength]);

  const { currentStageIndex, stageTimeRemaining } = useMemo(() => {
    let result: { currentStageIndex: number; stageTimeRemaining: number } = {
      currentStageIndex: adjustedStages.length - 1,
      stageTimeRemaining: 0
    };

    let elapsedTime = sessionLength - (minutes * 60 + seconds);

    for (let i = 0; i < adjustedStages.length; i++) {
      if (elapsedTime >= adjustedStages[i].duration) {
        elapsedTime -= adjustedStages[i].duration;
        continue;
      }

      // Only reached if in current stage, return current stage info
      // This uses a "break" statement to get around react compiler quirk
      // where if a memo returns an object it can only have one return statement
      result = {
        currentStageIndex: i,
        stageTimeRemaining: adjustedStages[i].duration - elapsedTime
      };
      break;
    }

    return result;
  }, [minutes, seconds, sessionLength, adjustedStages]);

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
