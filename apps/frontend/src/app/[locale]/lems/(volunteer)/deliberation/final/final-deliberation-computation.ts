import { JudgingCategory } from '@lems/database';
import { CategorizedRubrics, MetricPerCategory, Team } from '../types';
import { OptionalAwardNominations, RanksPerCategory } from './types';

/**
 * Extracts optional award nominations from a rubric
 */
export function extractOptionalAwards(rubrics: CategorizedRubrics): OptionalAwardNominations {
  const nominations: OptionalAwardNominations = {};

  if (!rubrics) return nominations;

  const categories: (keyof typeof rubrics)[] = [
    'innovation_project',
    'robot_design',
    'core_values'
  ];

  categories.forEach(category => {
    const rubric = rubrics[category];
    if (rubric?.data?.awards) {
      Object.entries(rubric.data.awards).forEach(([awardName, hasNomination]) => {
        if (hasNomination) {
          nominations[awardName as keyof OptionalAwardNominations] = true;
        }
      });
    }
  });

  return nominations;
}

/**
 * Computes ranking for teams based on scores and picklists.
 *
 * Teams are ranked by score (descending). Tied teams receive the same rank,
 * and the next rank accounts for the number of tied teams.
 *
 * @param teamScores - The team's raw scores
 * @param allTeamScores - Scores for all teams (used for relative ranking)
 * @returns MetricPerCategory object with ranks for each category and total
 */
export function computeRank(
  team: Team & { scores: MetricPerCategory },
  allTeams: (Team & { scores: MetricPerCategory })[],
  picklists: Record<JudgingCategory, string[]>
): Omit<MetricPerCategory, 'core-values-no-gp'> {
  const ranks: Omit<MetricPerCategory, 'core-values-no-gp'> = {
    'innovation-project': 0,
    'robot-design': 0,
    'core-values': 0,
    total: 0
  };

  // Helper: compute rank by category
  const computeRankByCategory = (category: keyof MetricPerCategory, teamScore: number): number => {
    if (category !== 'total' && picklists[category as JudgingCategory].includes(team.id)) {
      return picklists[category as JudgingCategory].indexOf(team.id) + 1;
    }

    const filteredTeams = allTeams.filter(
      t => category === 'total' || !picklists[category as JudgingCategory].includes(t.id)
    );

    // Count how many teams have a higher score
    const higherScoreCount = filteredTeams.filter(t => {
      const score = t.scores[category];
      return score > teamScore;
    }).length;
    return (
      higherScoreCount +
      1 +
      (category !== 'total' ? picklists[category as JudgingCategory].length : 0)
    );
  };

  // Compute ranks for each category
  (Object.keys(ranks) as (keyof typeof ranks)[]).forEach(category => {
    ranks[category] = computeRankByCategory(category, team.scores[category]);
  });

  return ranks;
}

export const computeChampionsEligibility = (
  team: Team & { ranks: RanksPerCategory },
  numOfAwards: number
): boolean => {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  return team.ranks.total <= numOfAwards;
};

export const computeCoreAwardsEligibility = (
  team: Team,
  picklists: Record<JudgingCategory, string[]>,
  manualNominations: string[]
): boolean => {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  return (
    Object.values(picklists).some(list => list.includes(team.id)) ||
    manualNominations.includes(team.id)
  );
};

export const computeOptionalAwardsEligibility = (
  team: Team & { awardNominations: OptionalAwardNominations },
  manualNominations: string[]
): boolean => {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  return Object.keys(team.awardNominations).length > 0 || manualNominations.includes(team.id);
};
