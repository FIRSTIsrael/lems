import { JudgingCategory } from '@lems/types/judging';
import { underscoresToHyphens } from '@lems/shared/utils';
import { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER } from '@lems/shared';
import type { Team, MetricPerCategory } from '../types';
import type { JudgingDeliberation } from './graphql/types';

// Re-export constants for backward compatibility
export { MAX_PICKLIST_LIMIT, PICKLIST_LIMIT_MULTIPLIER };

/**
 * Computes ranking for teams based on scores.
 *
 * Teams are ranked by score (descending). Tied teams receive the same rank,
 * and the next rank accounts for the number of tied teams.
 *
 * @param teamScores - The team's raw scores
 * @param allTeamScores - Scores for all teams (used for relative ranking)
 * @returns MetricPerCategory object with ranks for each category and total
 */
export function computeRank(
  teamScores: MetricPerCategory,
  allTeamScores: MetricPerCategory[],
  category: JudgingCategory | 'total' = 'total'
): number {
  const categoryKey = underscoresToHyphens(category) as
    | 'innovation-project'
    | 'robot-design'
    | 'core-values'
    | 'total';
  // Helper: compute rank by category
  const computeRankByCategory = (category: keyof MetricPerCategory, teamScore: number): number => {
    // Count how many teams have a higher score
    const higherScoreCount = allTeamScores.filter(ts => {
      const score = ts[category];
      return score > teamScore;
    }).length;
    return higherScoreCount + 1;
  };

  // return rank for given category
  return computeRankByCategory(categoryKey, teamScores[categoryKey]);
}

/**
 * Determines if a team is eligible for the picklist.
 *
 * A team is eligible if:
 * 1. It has arrived at the event
 * 2. It is not disqualified
 * 3. Its judging session status is 'completed'
 * 4. It is not already in the picklist
 *
 * @param team - The team to check
 * @param deliberation - The deliberation containing the picklist
 * @returns true if the team is eligible, false otherwise
 */
export function computeEligibility(team: Team, deliberation: JudgingDeliberation | null): boolean {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  if (!team.judgingSession?.status || team.judgingSession.status !== 'completed') {
    return false;
  }

  if (deliberation?.picklist.includes(team.id)) {
    return false;
  }

  return true;
}
