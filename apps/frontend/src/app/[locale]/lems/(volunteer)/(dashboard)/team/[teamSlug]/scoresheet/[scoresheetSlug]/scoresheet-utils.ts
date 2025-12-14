import { scoresheet } from '@lems/shared/scoresheet';
import type { ScoresheetData } from './scoresheet.graphql';

/**
 * Creates an empty scoresheet data object with all missions initialized.
 */
export const getEmptyScoresheet = (): ScoresheetData => {
  const missions: Record<string, Record<number, null>> = {};

  scoresheet.missions.forEach(mission => {
    missions[mission.id] = {};
    mission.clauses.forEach((_, clauseIndex) => {
      missions[mission.id][clauseIndex] = null;
    });
  });

  return { missions, score: 0, gp: { value: null } };
};
