'use client';

import { useEffect, useCallback, useRef, useReducer, useMemo } from 'react';
import { useJudgingSounds } from '@lems/shared';

// TODO: Allow selecting from a set of predefined templates
// That will accommodate multiple regions
export const JUDGING_STAGES = [
  { id: 'setup', duration: 120 }, // 2 min
  { id: 'innovation-presentation', duration: 300 }, // 5 min
  { id: 'innovation-questions', duration: 300 }, // 5 min
  { id: 'robot-presentation', duration: 300 }, // 5 min
  { id: 'robot-questions', duration: 300 }, // 5 min
  { id: 'final-thoughts', duration: 480 } // 8 min (International default)
];

export interface JudgingTimerState {
  currentStage: number;
  stageTimeRemaining: number;
  totalTimeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
}

export interface JudgingTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  forward: () => void;
  back: () => void;
}

type TimerState = {
  currentStage: number;
  stageTimeRemaining: number;
  isRunning: boolean;
};

type TimerAction =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'RESET'
  | 'TICK'
  | 'FORWARD'
  | 'BACK'
  | { type: 'STAGE_COMPLETE'; nextStage: number };

const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
  if (typeof action === 'object' && action.type === 'STAGE_COMPLETE') {
    return {
      currentStage: action.nextStage,
      stageTimeRemaining: JUDGING_STAGES[action.nextStage].duration,
      isRunning: false
    };
  }

  switch (action) {
    case 'START':
      return { ...state, isRunning: true };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESUME':
      return { ...state, isRunning: true };
    case 'STOP':
      return {
        currentStage: 0,
        stageTimeRemaining: JUDGING_STAGES[0].duration,
        isRunning: false
      };
    case 'RESET':
      return {
        currentStage: 0,
        stageTimeRemaining: JUDGING_STAGES[0].duration,
        isRunning: false
      };
    case 'TICK': {
      const newTime = state.stageTimeRemaining - 1;
      if (newTime <= 0 && state.currentStage < JUDGING_STAGES.length - 1) {
        return {
          ...state,
          currentStage: state.currentStage + 1,
          stageTimeRemaining: JUDGING_STAGES[state.currentStage + 1].duration
        };
      }
      if (newTime <= 0) {
        return { ...state, isRunning: false, stageTimeRemaining: 0 };
      }
      return { ...state, stageTimeRemaining: newTime };
    }
    case 'FORWARD': {
      if (state.currentStage < JUDGING_STAGES.length - 1) {
        const nextIndex = state.currentStage + 1;
        return {
          currentStage: nextIndex,
          stageTimeRemaining: JUDGING_STAGES[nextIndex].duration,
          isRunning: false
        };
      }
      return state;
    }
    case 'BACK': {
      // If at the start of current stage (within 1 second), go to previous stage
      // Otherwise, restart current stage
      const currentStageDuration = JUDGING_STAGES[state.currentStage].duration;
      if (state.stageTimeRemaining >= currentStageDuration - 1 && state.currentStage > 0) {
        const prevIndex = state.currentStage - 1;
        return {
          currentStage: prevIndex,
          stageTimeRemaining: JUDGING_STAGES[prevIndex].duration,
          isRunning: false
        };
      }
      return {
        ...state,
        stageTimeRemaining: currentStageDuration,
        isRunning: false
      };
    }
    default:
      return state;
  }
};

export const useJudgingTimer = (): [JudgingTimerState, JudgingTimerControls] => {
  const { playSound } = useJudgingSounds();

  const [state, dispatch] = useReducer(timerReducer, {
    currentStage: 0,
    stageTimeRemaining: JUDGING_STAGES[0].duration,
    isRunning: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStageRef = useRef(state.currentStage);

  const start = useCallback(() => {
    dispatch('START');
    playSound('start');
  }, [playSound]);

  const pause = useCallback(() => {
    dispatch('PAUSE');
  }, []);

  const resume = useCallback(() => {
    dispatch('RESUME');
  }, []);

  const stop = useCallback(() => {
    dispatch('STOP');
  }, []);

  const reset = useCallback(() => {
    dispatch('RESET');
  }, []);

  const forward = useCallback(() => {
    dispatch('FORWARD');
  }, []);

  const back = useCallback(() => {
    dispatch('BACK');
  }, []);

  useEffect(() => {
    if (state.isRunning && state.stageTimeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        dispatch('TICK');
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.stageTimeRemaining]);

  // Handle stage progression sound
  useEffect(() => {
    if (state.currentStage !== previousStageRef.current) {
      playSound('change');
      previousStageRef.current = state.currentStage;
    }
  }, [state.currentStage, playSound]);

  // Handle timer completion sound
  useEffect(() => {
    if (state.currentStage === JUDGING_STAGES.length - 1 && state.stageTimeRemaining === 0) {
      playSound('end');
    }
  }, [state.currentStage, state.stageTimeRemaining, playSound]);

  const totalTimeRemaining = useMemo(
    () =>
      JUDGING_STAGES.slice(state.currentStage + 1).reduce((sum, stage) => sum + stage.duration, 0) +
      state.stageTimeRemaining,
    [state.currentStage, state.stageTimeRemaining]
  );

  const isFinished =
    state.currentStage >= JUDGING_STAGES.length - 1 && state.stageTimeRemaining === 0;

  const timerState: JudgingTimerState = useMemo(
    () => ({
      currentStage: state.currentStage,
      stageTimeRemaining: state.stageTimeRemaining,
      totalTimeRemaining,
      isRunning: state.isRunning,
      isFinished
    }),
    [state.currentStage, state.stageTimeRemaining, totalTimeRemaining, state.isRunning, isFinished]
  );

  const controls: JudgingTimerControls = useMemo(
    () => ({ start, pause, resume, stop, reset, forward, back }),
    [start, pause, resume, stop, reset, forward, back]
  );

  return [timerState, controls];
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
