import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { Mission } from '@lems/types';

export interface Score {
  id: 'score'; // Can support multiple scores in the future
  missions: Array<Mission>;
  points: number;
}

interface ScoresDb extends DBSchema {
  scores: {
    key: string;
    value: Score;
  };
}

export const useScore = () => {
  const [score, setScore] = useState<ScoresDb['scores']['value'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDb = async () => {
      const db = await openDB<ScoresDb>('scores-database', 1, {
        upgrade(db) {
          db.createObjectStore('scores', { keyPath: 'id', autoIncrement: false });
        }
      });

      const currentScore = await db.get('scores', 'score');
      if (currentScore) setScore(currentScore);
      setLoading(false);
    };

    initDb();
  }, []);

  const updateScore = async (score: { missions: Mission[]; points: number }) => {
    const db = await openDB<ScoresDb>('scores-database', 1);
    const tx = db.transaction('scores', 'readwrite');
    const store = tx.objectStore('scores');
    await store.put({ id: 'score', ...score });
    await tx.done;

    setScore({ id: 'score', ...score });
  };

  const resetScore = async () => {
    const db = await openDB<ScoresDb>('scores-database', 1);
    const tx = db.transaction('scores', 'readwrite');
    const store = tx.objectStore('scores');
    await store.delete('score');
    await tx.done;
    setScore(null);
  };

  return { score, updateScore, resetScore, loading };
};
