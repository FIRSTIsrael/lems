/**
 * Data transformation utilities for final deliberations
 * Transforms raw GraphQL team data into DeliberationTeam objects
 */

import type { Team } from '../graphql/types';
import type { DeliberationTeam, TeamScores, OptionalAwardNominations } from './types';
import { calculateAllRanks, calculateTotalRank } from './ranking';

/**
 * Normalizes rubric scores to 0-1 range
 * Each rubric has multiple fields, each scored 1-4
 */
function normalizeRubricScore(
  rubric: { data?: { fields?: Record<string, { value: number | null }> } } | null | undefined
): number {
  if (!rubric?.data?.fields) return 0;

  const fields = Object.values(rubric.data.fields) as Array<{ value: number | null }>;
  const values = fields.map(f => f.value || 0);

  if (values.length === 0) return 0;

  const sum = values.reduce((acc, val) => acc + val, 0);
  const maxPossible = values.length * 4; // Each field max is 4

  return sum / maxPossible; // Returns 0-1
}

/**
 * Extracts optional award nominations from a rubric
 */
function extractOptionalAwards(rubrics: Team['rubrics']): OptionalAwardNominations {
  const nominations: OptionalAwardNominations = {};

  if (!rubrics) return nominations;

  // Check all three rubric categories for awards
  const categories = ['innovation_project', 'robot_design', 'core_values'] as const;

  categories.forEach(category => {
    const rubric = rubrics[category];
    if (rubric?.data?.awards) {
      Object.entries(rubric.data.awards).forEach(([awardName, hasNomination]) => {
        if (hasNomination) {
          nominations[awardName] = true;
        }
      });
    }
  });

  return nominations;
}

/**
 * Calculates robot game statistics from scoresheets
 */
function calculateRobotGameStats(scoresheets: Team['scoresheets']) {
  const gpScores = scoresheets
    .filter(s => s.data?.score != null)
    .map(s => s.data?.score || 0)
    .sort((a, b) => b - a); // Sort descending

  if (gpScores.length === 0) {
    return {
      gpScores: [],
      highestGpScore: 0,
      avgGpScore: 0,
      robotConsistency: 0
    };
  }

  const highestGpScore = gpScores[0];
  const avgGpScore = gpScores.reduce((sum, score) => sum + score, 0) / gpScores.length;

  // Calculate relative standard deviation (coefficient of variation)
  const variance =
    gpScores.reduce((sum, score) => sum + Math.pow(score - avgGpScore, 2), 0) / gpScores.length;
  const stdDev = Math.sqrt(variance);
  const robotConsistency = avgGpScore > 0 ? (stdDev / avgGpScore) * 100 : 0;

  return {
    gpScores,
    highestGpScore,
    avgGpScore,
    robotConsistency
  };
}

/**
 * Transforms a raw team object from GraphQL into a DeliberationTeam
 */
export function transformTeam(team: Team): Partial<DeliberationTeam> {
  const { rubrics, scoresheets } = team;

  // Calculate normalized scores for each category
  const scores: TeamScores = {
    'innovation-project': normalizeRubricScore(rubrics?.innovation_project),
    'robot-design': normalizeRubricScore(rubrics?.robot_design),
    'core-values': normalizeRubricScore(rubrics?.core_values),
    'robot-game': 0 // Will be set from GP scores
  };

  // Calculate robot game stats
  const robotStats = calculateRobotGameStats(scoresheets || []);
  scores['robot-game'] = robotStats.highestGpScore;

  // Extract optional award nominations
  const optionalAwardNominations = extractOptionalAwards(rubrics);

  return {
    id: team.id,
    number: parseInt(team.number, 10),
    name: team.name,
    affiliation: team.affiliation,
    city: team.city,
    scores,
    optionalAwardNominations,
    ...robotStats,
    disqualified: team.disqualified || false,
    arrived: team.arrived || false,
    // ranks and totalRank will be calculated after all teams are processed
    ranks: {
      'innovation-project': 0,
      'robot-design': 0,
      'core-values': 0,
      'robot-game': 0
    },
    totalRank: 0
  };
}

/**
 * Transforms an array of teams and calculates ranks
 */
export function transformTeams(teams: Team[]): DeliberationTeam[] {
  // First pass: transform all teams
  const partialTeams = teams.map(transformTeam) as DeliberationTeam[];

  // Second pass: calculate ranks
  const ranksMap = calculateAllRanks(partialTeams);

  // Third pass: assign ranks and calculate total ranks
  return partialTeams.map(team => {
    const ranks = ranksMap.get(team.id) || team.ranks;
    const totalRank = calculateTotalRank(ranks);

    return {
      ...team,
      ranks,
      totalRank
    };
  });
}
