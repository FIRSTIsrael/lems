'use client';

import { useEffect, useRef, useCallback } from 'react';

const SOUNDS = {
  start: '/assets/sounds/field/field-start.wav',
  abort: '/assets/sounds/field/field-abort.wav',
  endgame: '/assets/sounds/field/field-endgame.wav',
  end: '/assets/sounds/field/field-end.wav'
} as const;

type SoundType = keyof typeof SOUNDS;

export const useFieldSounds = () => {
  const soundRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    start: null,
    abort: null,
    endgame: null,
    end: null
  });

  useEffect(() => {
    Object.entries(SOUNDS).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = 'auto';
      soundRefs.current[key as SoundType] = audio;
    });

    return () => {
      Object.values(soundRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
      soundRefs.current = { start: null, abort: null, endgame: null, end: null };
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
