'use client';

import { useAudioPlayer } from './use-audio-player';

const FIELD_TIMER_SOUNDS = {
  start: '/assets/sounds/field/field-start.wav',
  endgame: '/assets/sounds/field/field-endgame.wav',
  end: '/assets/sounds/field/field-end.wav',
  abort: '/assets/sounds/field/field-abort.wav'
} as const;

export type FieldTimerSoundType = keyof typeof FIELD_TIMER_SOUNDS;

/**
 * Hook for field timer sounds with full SSR safety.
 * Provides sound effects for match events: start, endgame, end, and abort.
 *
 * @returns Object with:
 *   - playSound: Safe function to play sounds (won't error even if audio isn't ready)
 *   - isReady: Boolean indicating if audio has been initialized
 *
 * @example
 * const { playSound, isReady } = useTimerSounds();
 *
 * // Safe to call even if audio isn't initialized
 * playSound('start');
 *
 * // Check if ready before showing UI
 * if (isReady) {
 *   showSoundTestButton();
 * }
 */
export const useTimerSounds = () => {
  return useAudioPlayer<FieldTimerSoundType>({
    sounds: FIELD_TIMER_SOUNDS,
    preload: 'auto'
  });
};
