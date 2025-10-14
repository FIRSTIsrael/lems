'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface JudgingStage {
  id: string;
  name: string;
  nameHe: string;
  duration: number; // in seconds
}

export interface JudgingTimerState {
  currentStageIndex: number;
  currentStage: JudgingStage;
  nextStage: JudgingStage | null;
  timeRemainingInStage: number;
  totalTimeRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  stages: JudgingStage[];
}

export interface JudgingTimerControls {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  nextStage: () => void;
  previousStage: () => void;
  restartCurrentStage: () => void;
}

// isr time
const DEFAULT_STAGES: JudgingStage[] = [
  { id: 'setup', name: 'Setup Time', nameHe: 'זמן התארגנות', duration: 120 }, // 2 min
  { id: 'innovation-presentation', name: 'Innovation Project Presentation', nameHe: 'הצגת פרויקט חדשנות', duration: 300 }, // 5 min
  { id: 'innovation-questions', name: 'Innovation Project Questions', nameHe: 'שאלות פרויקט החדשנות', duration: 300 }, // 5 min
  { id: 'robot-presentation', name: 'Robot Design Presentation', nameHe: 'הצגת תכנון הרובוט', duration: 300 }, // 5 min
  { id: 'robot-questions', name: 'Robot Design Questions', nameHe: 'שאלות תכנון הרובוט', duration: 300 }, // 5 min
  { id: 'summary-sharing', name: 'Summary Sharing', nameHe: 'שיתוף מסכם', duration: 360 } // 6 min
];

export const useJudgingTimer = (customStages?: JudgingStage[]): [JudgingTimerState, JudgingTimerControls] => {
  const stages = customStages || DEFAULT_STAGES;
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [timeRemainingInStage, setTimeRemainingInStage] = useState(stages[0].duration);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = stages[currentStageIndex];
  const nextStage = currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1] : null;
  
  //total time remaining
  const totalTimeRemaining = stages
    .slice(currentStageIndex + 1)
    .reduce((sum, stage) => sum + stage.duration, 0) + timeRemainingInStage;

  const isFinished = currentStageIndex >= stages.length - 1 && timeRemainingInStage === 0;

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
    setCurrentStageIndex(0);
    setTimeRemainingInStage(stages[0].duration);
  }, [stages]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setCurrentStageIndex(0);
    setTimeRemainingInStage(stages[0].duration);
  }, [stages]);

  const nextStageHandler = useCallback(() => {
    if (currentStageIndex < stages.length - 1) {
      const newIndex = currentStageIndex + 1;
      setCurrentStageIndex(newIndex);
      setTimeRemainingInStage(stages[newIndex].duration);
    }
  }, [currentStageIndex, stages]);

  const previousStage = useCallback(() => {
    if (currentStageIndex > 0) {
      const newIndex = currentStageIndex - 1;
      setCurrentStageIndex(newIndex);
      setTimeRemainingInStage(stages[newIndex].duration);
    }
  }, [currentStageIndex, stages]);

  const restartCurrentStage = useCallback(() => {
    setTimeRemainingInStage(stages[currentStageIndex].duration);
  }, [currentStageIndex, stages]);

  useEffect(() => {
    if (isRunning && timeRemainingInStage > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemainingInStage((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {

            if (currentStageIndex < stages.length - 1) {
              setCurrentStageIndex(currentStageIndex + 1);
              return stages[currentStageIndex + 1].duration;
            } else {
              setIsRunning(false);
              return 0;
            }
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
  }, [isRunning, timeRemainingInStage, currentStageIndex, stages]);

  const state: JudgingTimerState = {
    currentStageIndex,
    currentStage,
    nextStage,
    timeRemainingInStage,
    totalTimeRemaining,
    isRunning,
    isFinished,
    stages
  };

  const controls: JudgingTimerControls = {
    start,
    pause,
    resume,
    stop,
    reset,
    nextStage: nextStageHandler,
    previousStage,
    restartCurrentStage
  };

  return [state, controls];
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
