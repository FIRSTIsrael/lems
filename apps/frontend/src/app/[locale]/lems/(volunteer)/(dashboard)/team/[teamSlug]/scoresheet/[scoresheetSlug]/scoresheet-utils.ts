import { scoresheet } from '@lems/shared/scoresheet';
import type { ScoresheetData, ScoresheetMissionClause } from './scoresheet.graphql';

/**
 * Creates an empty scoresheet data object with all missions initialized.
 */
export const getEmptyScoresheet = (): ScoresheetData => {
  const missions: Record<string, { clauses: ScoresheetMissionClause[] }> = {};

  scoresheet.missions.forEach(mission => {
    missions[mission.id] = {
      clauses: mission.clauses.map(clause => ({
        type: clause.type,
        value: null
      }))
    };
  });

  return { missions, score: 0, gp: { value: null } };
};
