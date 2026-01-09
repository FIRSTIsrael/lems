'use client';

import { useEffect, useCallback, useRef, useReducer, useMemo } from 'react';
import { useTimerSounds } from '@lems/shared';

const MATCH_TIME = 150; // Default match time in seconds (2.5 minutes)

export interface FieldTimerState {
  timeRemaining: number;
  isRunning: boolean;
  matchLength: number;
}

export interface FieldTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
}

type TimerState = {
  timeRemaining: number;
  isRunning: boolean;
};

type TimerAction = 'START' | 'PAUSE' | 'RESUME' | 'STOP' | 'RESET' | 'TICK';

const timerReducer = (state: TimerState, action: TimerAction): TimerState => {
  switch (action) {
    case 'START':
      return { ...state, isRunning: true };
    case 'PAUSE':
      return { ...state, isRunning: false };
    case 'RESUME':
      return { ...state, isRunning: true };
    case 'STOP':
      return { ...state, isRunning: false, timeRemaining: MATCH_TIME };
    case 'RESET': {
      return { isRunning: false, timeRemaining: MATCH_TIME };
    }
    case 'TICK': {
      const newTime = state.timeRemaining - 1;
      if (newTime <= 0) {
        return { ...state, isRunning: false, timeRemaining: 0 };
      }
      return { ...state, timeRemaining: newTime };
    }
    default:
      return state;
  }
};

export const useFieldTimer = (): [FieldTimerState, FieldTimerControls] => {
  const { playSound } = useTimerSounds();

  const [state, dispatch] = useReducer(timerReducer, {
    timeRemaining: MATCH_TIME,
    isRunning: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    playSound('abort');
  }, [playSound]);

  const reset = useCallback(() => {
    dispatch('RESET');
  }, []);

  useEffect(() => {
    if (state.isRunning && state.timeRemaining > 0) {
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
  }, [state.isRunning, state.timeRemaining]);

  useEffect(() => {
    if (state.timeRemaining === 30) {
      playSound('endgame');
    }
    if (state.timeRemaining === 0) {
      playSound('end');
    }
  }, [state.timeRemaining, playSound]);

  const timerState: FieldTimerState = useMemo(
    () => ({
      timeRemaining: state.timeRemaining,
      isRunning: state.isRunning,
      matchLength: MATCH_TIME
    }),
    [state.timeRemaining, state.isRunning]
  );

  const controls: FieldTimerControls = useMemo(
    () => ({ start, pause, resume, stop, reset }),
    [start, pause, resume, stop, reset]
  );

  const result: [FieldTimerState, FieldTimerControls] = useMemo(
    () => [timerState, controls],
    [timerState, controls]
  );

  return result;
};
