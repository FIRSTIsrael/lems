'use client';

import { useEffect, useRef } from 'react';

export const useTimerSounds = () => {
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endgameSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    startSoundRef.current = new Audio('/assets/sounds/field/field-start.wav');
    endgameSoundRef.current = new Audio('/assets/sounds/field/field-endgame.wav');
    endSoundRef.current = new Audio('/assets/sounds/field/field-end.wav');

    startSoundRef.current.preload = 'auto';
    endgameSoundRef.current.preload = 'auto';
    endSoundRef.current.preload = 'auto';

    return () => {
      if (startSoundRef.current) {
        startSoundRef.current.pause();
        startSoundRef.current = null;
      }
      if (endgameSoundRef.current) {
        endgameSoundRef.current.pause();
        endgameSoundRef.current = null;
      }
      if (endSoundRef.current) {
        endSoundRef.current.pause();
        endSoundRef.current = null;
      }
    };
  }, []);

  const playStartSound = () => {
    if (startSoundRef.current) {
      startSoundRef.current.currentTime = 0;
      startSoundRef.current.play().catch(console.error);
    }
  };

  const playEndgameSound = () => {
    if (endgameSoundRef.current) {
      endgameSoundRef.current.currentTime = 0;
      endgameSoundRef.current.play().catch(console.error);
    }
  };

  const playEndSound = () => {
    if (endSoundRef.current) {
      endSoundRef.current.currentTime = 0;
      endSoundRef.current.play().catch(console.error);
    }
  };

  return {
    playStartSound,
    playEndgameSound,
    playEndSound
  };
};
