'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

export interface AudioPlayerOptions {
  sounds: Record<string, string>;
  preload?: 'auto' | 'metadata' | 'none';
}

/**
 * Generic SSR-safe audio player hook with multiple defensive layers.
 * Safely handles Audio API usage in Next.js App Router with server-side rendering.
 *
 * @template T - The type of sound keys (e.g., 'start' | 'end' | 'abort')
 * @param options - Configuration object with sounds mapping and preload strategy
 * @returns Object with playSound function and isReady state
 *
 * @example
 * const { playSound, isReady } = useAudioPlayer({
 *   sounds: { start: '/audio/start.wav', end: '/audio/end.wav' },
 *   preload: 'auto'
 * });
 *
 * // Safe to call even if audio isn't ready
 * playSound('start');
 */
export const useAudioPlayer = <T extends string>(
  options: AudioPlayerOptions
) => {
  const { sounds, preload = 'auto' } = options;
  const soundRefs = useRef<Record<T, HTMLAudioElement | null>>(
    {} as Record<T, HTMLAudioElement | null>
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Guard #1: SSR safety - only run in browser
    if (typeof window === 'undefined') {
      return;
    }

    // Guard #2: Check if Audio API is available
    if (typeof Audio === 'undefined') {
      console.warn('Audio API not available in this environment');
      return;
    }

    // Initialize all audio elements with error handling
    try {
      Object.entries(sounds).forEach(([key, path]) => {
        const audio = new Audio(path as string);
        audio.preload = preload;
        soundRefs.current[key as T] = audio;
      });
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }

    // Cleanup function
    return () => {
      Object.values(soundRefs.current).forEach((audio: unknown) => {
        if (audio instanceof HTMLAudioElement) {
          audio.pause();
          audio.src = ''; // Release resources
        }
      });
      soundRefs.current = {} as Record<T, HTMLAudioElement | null>;
      setIsReady(false);
    };
  }, [sounds, preload]);

  const playSound = useCallback(
    (type: T) => {
      // Guard #1: SSR safety check
      if (typeof window === 'undefined') {
        return;
      }

      // Guard #2: Check if audio is initialized
      if (!isReady) {
        console.warn(`Audio not ready, cannot play sound: ${type}`);
        return;
      }

      // Guard #3: Check if audio element exists
      const audio = soundRefs.current[type];
      if (!audio) {
        console.warn(`Audio element not found: ${type}`);
        return;
      }

      // Guard #4: Safe play with comprehensive error handling
      try {
        audio.currentTime = 0;
        audio.play().catch(error => {
          // Catch play() promise rejection (common in some browsers)
          console.error(`Failed to play sound ${type}:`, error);
        });
      } catch (error) {
        console.error(`Error playing sound ${type}:`, error);
      }
    },
    [isReady]
  );

  return { playSound, isReady };
};
