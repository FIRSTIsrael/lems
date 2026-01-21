import { FinalDeliberationAwards, JudgingCategory } from '@lems/database';
import { compareScoreArrays } from '@lems/shared/utils/arrays';
import { CategorizedRubrics, MetricPerCategory, Team } from '../types';
import { EnrichedTeam, OptionalAwardNominations, RanksPerCategory } from './types';

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
  team: Team & { scores: MetricPerCategory; robotGameScores: number[] },
  allTeams: (Team & { scores: MetricPerCategory; robotGameScores: number[] })[],
  picklists: Record<JudgingCategory, string[]>
): RanksPerCategory {
  const ranks: RanksPerCategory = {
    'innovation-project': 0,
    'robot-design': 0,
    'core-values': 0,
    'robot-game': 0,
    total: 0
  };

  // Helper: compute rank by category
  const computeRankByCategory = (category: JudgingCategory, teamScore: number): number => {
    if (picklists[category].includes(team.id)) {
      return picklists[category].indexOf(team.id) + 1;
    }

    const filteredTeams = allTeams.filter(t => !picklists[category].includes(t.id));

    // Count how many teams have a higher score
    const higherScoreCount = filteredTeams.filter(t => {
      const score = t.scores[category];
      return score > teamScore;
    }).length;
    return higherScoreCount + 1 + picklists[category].length;
  };

  // Compute ranks for each category
  (['core-values', 'innovation-project', 'robot-design'] as JudgingCategory[]).forEach(category => {
    ranks[category] = computeRankByCategory(category, team.scores[category]);
  });

  // Compute robot-game rank using compareScoreArrays
  const sortedTeams = [...allTeams].sort((a, b) =>
    compareScoreArrays(a.robotGameScores, b.robotGameScores)
  );

  const teamIndex = sortedTeams.findIndex(t => t.id === team.id);
  ranks['robot-game'] = teamIndex >= 0 ? teamIndex + 1 : allTeams.length;

  ranks.total =
    (ranks['innovation-project'] +
      ranks['robot-design'] +
      ranks['core-values'] +
      ranks['robot-game']) /
    4;

  return ranks;
}

export const computeChampionsEligibility = (
  teamId: string,
  sortedTeams: EnrichedTeam[],
  numOfEligibleTeams: number
): boolean => {
  const team = sortedTeams.find(t => t.id === teamId);
  const teamRank = sortedTeams.findIndex(t => t.id === teamId) + 1;
  if (!team) return false;

  if (!team.arrived) return false;

  if (team.disqualified) return false;

  return teamRank <= numOfEligibleTeams;
};

export const computeCoreAwardsEligibility = (
  team: Team,
  picklists: Record<JudgingCategory, string[]>,
  awards: FinalDeliberationAwards,
  manualNominations: string[]
): boolean => {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  const winningTeamIds = Object.entries(awards)
    .filter(([key]) => key !== 'robot-performance')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, awardList]) => (Array.isArray(awardList) ? awardList : Object.values(awardList)))
    .flat();
  // Check if team has already won an award
  if (winningTeamIds.includes(team.id)) return false;

  return (
    Object.values(picklists).some(list => list.includes(team.id)) ||
    manualNominations.includes(team.id)
  );
};

export const computeOptionalAwardsEligibility = (
  team: Team & { awardNominations: OptionalAwardNominations },
  awards: FinalDeliberationAwards,
  manualNominations: string[]
): boolean => {
  if (!team.arrived) return false;

  if (team.disqualified) return false;

  const winningTeamIds = Object.entries(awards)
    .filter(([key]) => key !== 'robot-performance')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, awardList]) => (Array.isArray(awardList) ? awardList : Object.values(awardList)))
    .flat();
  // Check if team has already won an award
  if (winningTeamIds.includes(team.id)) return false;

  return Object.keys(team.awardNominations).length > 0 || manualNominations.includes(team.id);
};
