import type { JudgingCategory } from '@lems/database';
import { compareScoreArrays } from '../utils';

/**
 * Team with enriched rank data
 */
export interface TeamWithRanks {
  teamId: string;
  teamNumber: number;
  ranks: {
    'innovation-project': number;
    'robot-design': number;
    'core-values': number;
    'robot-game': number;
  };
  averageRank: number;
}

/**
 * Data required for rank calculations
 */
export interface RankCalculationData {
  teamId: string;
  teamNumber: number;
  rubricScores: Record<JudgingCategory, number>;
  gpScore: number; // GP score (used for core-values tiebreaker)
  robotGameScores: number[];
}

/**
 * Calculates the rank for a team in a specific judging category.
 * Teams in the picklist get rank from their position.
 * Teams outside the picklist get rank based on summed rubric scores.
 *
 * @param teamData - The team's rubric scores and data
 * @param allTeams - All teams' data for comparison
 * @param category - The judging category to calculate rank for
 * @param picklist - Array of team IDs in picklist order (1st position = highest rank)
 * @returns The rank for this team in this category (lower is better)
 */
export function calculateCategoryRank(
  teamData: RankCalculationData,
  allTeams: RankCalculationData[],
  category: JudgingCategory,
  picklist: string[]
): number {
  // If team is in the picklist, rank = position + 1
  const picklistIndex = picklist.indexOf(teamData.teamId);
  if (picklistIndex !== -1) {
    return picklistIndex + 1;
  }

  // Teams outside picklist: rank by rubric score (descending)
  // Count how many teams outside the picklist have a higher score
  const teamScore = teamData.rubricScores[category] ?? 0;
  const picklistSet = new Set(picklist);

  const higherScoreCount = allTeams.filter(t => {
    // Skip teams in the picklist (they're ranked separately)
    if (picklistSet.has(t.teamId)) {
      return false;
    }
    return (t.rubricScores[category] ?? 0) > teamScore;
  }).length;

  // Rank = count of higher-scoring teams + 1 + picklist size
  return higherScoreCount + 1 + picklist.length;
}

/**
 * Calculates ranks for a team across all three judging categories
 * and returns the average rank with core-values rank as tiebreaker.
 *
 * @param teamData - The team's scores and data
 * @param allTeams - All teams' data for comparison
 * @param picklists - Picklists for each judging category
 * @returns TeamWithRanks containing individual ranks, average, and tiebreaker
 */
export function calculateTeamRanks(
  teamData: RankCalculationData,
  allTeams: RankCalculationData[],
  picklists: Partial<Record<JudgingCategory, string[]>>
): TeamWithRanks {
  const categories: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];
  const ranks: Record<JudgingCategory | 'robot-game', number> = {
    'innovation-project': 0,
    'robot-design': 0,
    'core-values': 0,
    'robot-game': 0
  };

  // Calculate rank for each category
  categories.forEach(category => {
    const picklist = picklists[category] ?? [];
    ranks[category] = calculateCategoryRank(teamData, allTeams, category, picklist);
  });

  // Calculate robot game rank
  ranks['robot-game'] =
    allTeams
      .sort((a, b) => compareScoreArrays(a.robotGameScores, b.robotGameScores))
      .indexOf(teamData) + 1;

  // Calculate average rank
  const averageRank =
    (ranks['innovation-project'] +
      ranks['robot-design'] +
      ranks['core-values'] +
      ranks['robot-game']) /
    4;

  return {
    teamId: teamData.teamId,
    teamNumber: teamData.teamNumber,
    ranks: {
      'innovation-project': ranks['innovation-project'],
      'robot-design': ranks['robot-design'],
      'core-values': ranks['core-values'],
      'robot-game': ranks['robot-game']
    },
    averageRank
  };
}

/**
 * Sorts teams by average rank (ascending), with core-values rank as tiebreaker.
 * Returns the top N teams based on advancement percentage.
 *
 * @param teamsWithRanks - Teams with calculated ranks
 * @param advancementPercent - Percentage of teams to advance (0-100)
 * @returns Array of team IDs that are advancing, sorted by rank
 */
export function selectAdvancingTeams(
  teamsWithRanks: TeamWithRanks[],
  championsIds: string[],
  advancementPercent: number
): string[] {
  if (advancementPercent <= 0) {
    return [];
  }

  // Sort by: average rank (ascending), then core-values rank (ascending), then team number (ascending)
  const sorted = [...teamsWithRanks]
    .filter(team => !championsIds.includes(team.teamId))
    .sort((a, b) => {
      const avgDiff = a.averageRank - b.averageRank;
      if (avgDiff !== 0) return avgDiff;

      const cvDiff = a.ranks['core-values'] - b.ranks['core-values'];
      if (cvDiff !== 0) return cvDiff;

      return a.teamNumber - b.teamNumber;
    });

  // Calculate how many teams advance
  const advancingCount =
    Math.round((teamsWithRanks.length * advancementPercent) / 100) - championsIds.length;

  // Return top N team IDs
  return sorted.slice(0, advancingCount).map(t => t.teamId);
}
