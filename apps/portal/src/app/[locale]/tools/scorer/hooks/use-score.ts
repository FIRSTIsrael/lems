import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';
import { Mission, MissionClause } from '@lems/types/scoring';
import {
  DEFAULT_SCORESHEET_SEASON,
  ScoresheetError,
  type ScoresheetSchema
} from '@lems/shared/scoresheet';
import type { Edition } from '@lems/shared/edition';
import { useToolEdition } from '../../hooks/use-tool-edition';
import { useToolScoresheet } from './use-tool-scoresheet';

export interface Score {
  id: string; // 'score' for the current season's founders edition, see getScoreKey
  version: string;
  missions: Mission[];
  missionErrors: ErrorWithMessage[];
  validatorErrors: ErrorWithMessage[];
  points: number;
}

export interface ErrorWithMessage {
  id: string;
  mission?: string;
}

interface ScoresDb extends DBSchema {
  scores: {
    key: string;
    value: Score;
  };
}

const getScoreKey = (season: string, edition: Edition) => {
  if (season !== DEFAULT_SCORESHEET_SEASON) return `score-${season}`;
  return edition === 'founders' ? 'score' : `score-${edition}`;
};

const calculateScore = (scoresheet: ScoresheetSchema, values: Mission[]) => {
  let points = 0;
  const errors: ErrorWithMessage[] = [];

  scoresheet.missions.forEach((mission, missionIndex) => {
    const clauses = values[missionIndex].clauses;
    try {
      points += mission.calculation(...clauses.map(clause => clause.value));
    } catch (error) {
      if (error instanceof ScoresheetError) {
        errors.push({ mission: mission.id, id: error.id });
      }
    }
  });
  return { points, errors };
};

const validate = (scoresheet: ScoresheetSchema, values: Mission[]) => {
  const validatorErrors: Array<ErrorWithMessage> = [];
  const validatorArgs = Object.fromEntries(
    values.map((m: Mission) => [m.id, m.clauses.map((c: MissionClause) => c.value)])
  );

  scoresheet.validators.forEach(validator => {
    try {
      validator(validatorArgs);
    } catch (error) {
      if (error instanceof ScoresheetError) {
        validatorErrors.push({ id: error.id });
      }
    }
  });

  return validatorErrors;
};

export const useScore = () => {
  const scoresheet = useToolScoresheet();
  const scoreKey = getScoreKey(scoresheet.season, useToolEdition());
  const scoresheetVersion = scoresheet._version;
  const [score, setScore] = useState<ScoresDb['scores']['value'] | null>(null);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  // Loading until the draft for the current edition has been read (also while switching editions)
  const loading = loadedKey !== scoreKey;

  useEffect(() => {
    let cancelled = false;
    const initDb = async () => {
      const db = await openDB<ScoresDb>('scores-database', 1, {
        upgrade(db) {
          db.createObjectStore('scores', { keyPath: 'id', autoIncrement: false });
        }
      });

      const currentScore = await db.get('scores', scoreKey);
      if (cancelled) return;
      setScore(currentScore && currentScore.version === scoresheetVersion ? currentScore : null);
      setLoadedKey(scoreKey);
    };

    initDb();
    return () => {
      cancelled = true;
    };
  }, [scoreKey, scoresheetVersion]);

  const updateScore = async (missions: Mission[]) => {
    const { points, errors: missionErrors } = calculateScore(scoresheet, missions);
    const validatorErrors = validate(scoresheet, missions);

    const newScore: Score = {
      id: scoreKey,
      version: scoresheet._version,
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
    await store.delete(scoreKey);
    await tx.done;
    setScore(null);
  };

  return { score: loading ? null : score, updateScore, resetScore, loading };
};
