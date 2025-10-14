'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface FieldTimerState {
  timeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  totalTime: number;
}

export interface FieldTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  setTime: (time: number) => void;
}

export const useFieldTimer = (initialTime: number = 150): [FieldTimerState, FieldTimerControls] => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isFinished = timeRemaining === 0;

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(totalTime);
  }, [totalTime]);

  const reset = useCallback((newTime?: number) => {
    const resetTime = newTime ?? totalTime;
    setIsRunning(false);
    setTimeRemaining(resetTime);
    setTotalTime(resetTime);
  }, [totalTime]);

  const setTime = useCallback((time: number) => {
    setTotalTime(time);
    setTimeRemaining(time);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
            return 0;
          }
          return newTime;
        });
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
  }, [isRunning, timeRemaining]);

  const state: FieldTimerState = {
    timeRemaining,
    isRunning,
    isFinished,
    totalTime
  };

  const controls: FieldTimerControls = {
    start,
    pause,
    resume,
    stop,
    reset,
    setTime
  };

  return [state, controls];
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
