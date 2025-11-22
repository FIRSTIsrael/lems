'use client';

import { useEffect, useCallback, useRef, useReducer, useMemo } from 'react';

// Judging stages with durations in seconds
export const JUDGING_STAGES = [
  { id: 'setup', duration: 120 }, // 2 min - Welcome
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
  isRunning: boolean;
  isFinished: boolean;
}

type TimerState = {
  currentStageIndex: number;
  stageTimeRemaining: number;
  isRunning: boolean;
};

type TimerAction = 'START' | 'TICK' | 'RESET' | 'ABORT';

const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
  switch (action) {
    case 'START':
      return { ...state, isRunning: true };
    case 'RESET':
      return {
        currentStageIndex: 0,
        stageTimeRemaining: JUDGING_STAGES[0].duration,
        isRunning: false
      };
    case 'TICK': {
      const newTime = state.stageTimeRemaining - 1;

      // If current stage time is up, move to next stage
      if (newTime <= 0 && state.currentStageIndex < JUDGING_STAGES.length - 1) {
        return {
          ...state,
          currentStageIndex: state.currentStageIndex + 1,
          stageTimeRemaining: JUDGING_STAGES[state.currentStageIndex + 1].duration
        };
      }

      // If this is the last stage and time is up, stop running
      if (newTime <= 0) {
        return { ...state, isRunning: false, stageTimeRemaining: 0 };
      }

      return { ...state, stageTimeRemaining: newTime };
    }
    case 'ABORT':
      return {
        currentStageIndex: 0,
        stageTimeRemaining: JUDGING_STAGES[0].duration,
        isRunning: false
      };
    default:
      return state;
  }
};

/**
 * Hook for managing a rigid judging session timer
 * Timer automatically advances through stages based on duration
 * No manual skip, pause, or resume controls
 * Auto-starts immediately on mount
 */
export const useJudgingSessionTimer = (initialStartTime?: string) => {
  const [state, dispatch] = useReducer(timerReducer, {
    currentStageIndex: 0,
    stageTimeRemaining: JUDGING_STAGES[0].duration,
    isRunning: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStageRef = useRef(state.currentStageIndex);
  const soundsLoadedRef = useRef<Record<string, HTMLAudioElement | null>>({
    start: null,
    change: null,
    end: null
  });

  // Initialize sounds
  useEffect(() => {
    soundsLoadedRef.current.start = new Audio('/assets/sounds/judging/judging-start.wav');
    soundsLoadedRef.current.change = new Audio('/assets/sounds/judging/judging-change.wav');
    soundsLoadedRef.current.end = new Audio('/assets/sounds/judging/judging-end.wav');

    Object.values(soundsLoadedRef.current).forEach(audio => {
      if (audio) audio.preload = 'auto';
    });

    return () => {
      Object.values(soundsLoadedRef.current).forEach(audio => {
        if (audio) audio.pause();
      });
    };
  }, []);

  const playSound = useCallback((type: 'start' | 'change' | 'end') => {
    const audio = soundsLoadedRef.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Silently fail if sound can't play
      });
    }
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    dispatch('RESET');
  }, []);

  // Abort and reset the session
  const abort = useCallback(() => {
    dispatch('ABORT');
  }, []);

  // Set up interval for ticking
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

  // Calculate total time remaining (current stage + all remaining stages)
  const totalTimeRemaining = useMemo(
    () =>
      JUDGING_STAGES.slice(state.currentStageIndex + 1).reduce(
        (sum, stage) => sum + stage.duration,
        0
      ) + state.stageTimeRemaining,
    [state.currentStageIndex, state.stageTimeRemaining]
  );

  const isFinished =
    state.currentStageIndex >= JUDGING_STAGES.length - 1 && state.stageTimeRemaining === 0;

  // Play sound and handle state transitions
  useEffect(() => {
    if (state.currentStageIndex !== previousStageRef.current) {
      if (previousStageRef.current === 0) {
        playSound('start');
      } else {
        playSound('change');
      }
      previousStageRef.current = state.currentStageIndex;
    }
  }, [state.currentStageIndex, playSound]);

  // Play end sound
  useEffect(() => {
    if (isFinished) {
      playSound('end');
    }
  }, [isFinished, playSound]);

  const timerState: JudgingSessionTimerState = useMemo(
    () => ({
      currentStageIndex: state.currentStageIndex,
      stageTimeRemaining: state.stageTimeRemaining,
      totalTimeRemaining,
      isRunning: state.isRunning,
      isFinished
    }),
    [
      state.currentStageIndex,
      state.stageTimeRemaining,
      totalTimeRemaining,
      state.isRunning,
      isFinished
    ]
  );

  return {
    timerState,
    controls: { reset, abort }
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
