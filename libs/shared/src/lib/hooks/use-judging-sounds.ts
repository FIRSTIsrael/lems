'use client';

import { useAudioPlayer } from './use-audio-player';

const JUDGING_SOUNDS = {
  start: '/assets/sounds/judging/judging-start.wav',
  change: '/assets/sounds/judging/judging-change.wav',
  end: '/assets/sounds/judging/judging-end.wav'
} as const;

export type JudgingSoundType = keyof typeof JUDGING_SOUNDS;

/**
 * Hook for judging timer sounds with full SSR safety.
 * Provides sound effects for judging session events: start, change (rubric category change), and end.
 *
 * @returns Object with:
 *   - playSound: Safe function to play sounds (won't error even if audio isn't ready)
 *   - isReady: Boolean indicating if audio has been initialized
 *
 * @example
 * const { playSound, isReady } = useJudgingSounds();
 *
 * // Safe to call even if audio isn't initialized
 * playSound('start');
 *
 * // Check if ready before showing UI
 * if (isReady) {
 *   showSoundTestButton();
 * }
 */
export const useJudgingSounds = () => {
  return useAudioPlayer<JudgingSoundType>({
    sounds: JUDGING_SOUNDS,
    preload: 'auto'
  });
};
