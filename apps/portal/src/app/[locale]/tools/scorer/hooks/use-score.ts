import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { Mission, MissionClause } from '@lems/types';
import { scoresheet, ScoresheetError } from '@lems/shared/scoresheet';

export interface Score {
  id: 'score'; // Can support multiple scores in the future
  season: string;
  missions: Mission[];
  missionErrors: ErrorWithMessage[];
  validatorErrors: ErrorWithMessage[];
  points: number;
}

export interface ErrorWithMessage {
  id: string;
  description: string;
}

interface ScoresDb extends DBSchema {
  scores: {
    key: string;
    value: Score;
  };
}

const calculateScore = (values: Mission[]) => {
  let points = 0;
  const errors: ErrorWithMessage[] = [];

  scoresheet.missions.forEach((mission, missionIndex) => {
    const clauses = values[missionIndex].clauses;
    try {
      points += mission.calculation(...clauses.map(clause => clause.value));
    } catch (error) {
      if (error instanceof ScoresheetError) {
        const description = `errors.${error.id}.description`; // Translation key in shared locale
        errors.push({ id: error.id, description });
      }
    }
  });
  return { points, errors };
};

const validate = (values: Mission[]) => {
  const validatorErrors: Array<ErrorWithMessage> = [];
  const validatorArgs = Object.fromEntries(
    values.map((m: Mission) => [m.id, m.clauses.map((c: MissionClause) => c.value)])
  );

  scoresheet.validators.forEach(validator => {
    try {
      validator(validatorArgs);
    } catch (error) {
      if (error instanceof ScoresheetError) {
        const description = `errors.${error.id}.description`; // Translation key in shared locale
        validatorErrors.push({ id: error.id, description });
      }
    }
  });

  return validatorErrors;
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
      if (currentScore && currentScore.season === scoresheet.season) setScore(currentScore);
      setLoading(false);
    };

    initDb();
  }, []);

  const updateScore = async (missions: Mission[]) => {
    const { points, errors: missionErrors } = calculateScore(missions);
    const validatorErrors = validate(missions);

    const newScore: Score = {
      id: 'score',
      season: scoresheet.season,
      missions,
      points,
      missionErrors,
      validatorErrors
    };

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
