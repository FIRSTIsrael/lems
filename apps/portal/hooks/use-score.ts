import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { Mission } from '@lems/types';
import { ScoresheetError, SEASON_SCORESHEET } from '@lems/season';

export interface Score {
  id: 'score'; // Can support multiple scores in the future
  missions: Mission[];
  points: number;
}

interface ScoresDb extends DBSchema {
  scores: {
    key: string;
    value: Score;
  };
}

const calculateScore = (values: Mission[]) => {
  let points = 0;

  SEASON_SCORESHEET.missions.forEach((mission, missionIndex) => {
    const clauses = values[missionIndex].clauses;
    try {
      points += mission.calculation(...clauses.map(clause => clause.value));
    } catch (error) {
      if (error instanceof ScoresheetError) {
        //TODO: implement mission errors
      }
    }
  });
  return { points };
};

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

  const updateScore = async (missions: Mission[]) => {
    const { points } = calculateScore(missions);
    const newScore: Score = { id: 'score', missions, points };

    const db = await openDB<ScoresDb>('scores-database', 1);
    const tx = db.transaction('scores', 'readwrite');
    const store = tx.objectStore('scores');
    await store.put(newScore);
    await tx.done;

    setScore(newScore);
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
