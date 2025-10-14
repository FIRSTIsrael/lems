'use client';

import { useEffect, useRef, useCallback } from 'react';

const SOUNDS = {
  start: '/assets/sounds/field/field-start.wav',
  endgame: '/assets/sounds/field/field-endgame.wav',
  end: '/assets/sounds/field/field-end.wav',
  abort: '/assets/sounds/field/field-abort.wav'
} as const;

type SoundType = keyof typeof SOUNDS;

export const useTimerSounds = () => {
  const soundRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    start: null,
    endgame: null,
    end: null,
    abort: null
  });

  useEffect(() => {
    // Initialize all sounds
    Object.entries(SOUNDS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      soundRefs.current[key as SoundType] = audio;
    });

    // Cleanup
    return () => {
      Object.values(soundRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      soundRefs.current = { start: null, endgame: null, end: null, abort: null };
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const audio = soundRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  }, []);

  return playSound;
};
