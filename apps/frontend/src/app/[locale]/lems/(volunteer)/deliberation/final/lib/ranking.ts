/**
 * Team ranking calculation utilities for final deliberations
 */

import type { JudgingCategory } from '@lems/types/judging';
import type { DeliberationTeam, TeamRanks } from './types';

const JUDGING_CATEGORIES: JudgingCategory[] = ['innovation-project', 'robot-design', 'core-values'];

/**
 * Calculates the total rank for a team across all categories
 * Total rank is the sum of ranks across all judging categories
 */
export function calculateTotalRank(ranks: TeamRanks): number {
  return JUDGING_CATEGORIES.reduce((sum, category) => sum + (ranks[category] || 0), 0);
}

/**
 * Calculates ranks for all teams based on their normalized scores
 * Rank 1 = highest score, Rank N = lowest score
 */
export function calculateTeamRanks(
  teams: DeliberationTeam[],
  category: JudgingCategory | 'robot-game'
): Map<string, number> {
  const ranksMap = new Map<string, number>();

  // Sort teams by score (descending - highest score gets rank 1)
  const sorted = [...teams].sort((a, b) => {
    const aScore = a.scores[category] || 0;
    const bScore = b.scores[category] || 0;
    return bScore - aScore; // Descending order
  });

  // Assign ranks (1-indexed)
  sorted.forEach((team, index) => {
    ranksMap.set(team.id, index + 1);
  });

  return ranksMap;
}

/**
 * Calculates all category ranks for all teams
 * Returns a map of teamId -> ranks object
 */
export function calculateAllRanks(teams: DeliberationTeam[]): Map<string, TeamRanks> {
  const allRanksMap = new Map<string, TeamRanks>();

  // Initialize ranks for each team
  teams.forEach(team => {
    allRanksMap.set(team.id, {
      'innovation-project': 0,
      'robot-design': 0,
      'core-values': 0,
      'robot-game': 0
    });
  });

  // Calculate ranks for each category
  const categories: Array<JudgingCategory | 'robot-game'> = [...JUDGING_CATEGORIES, 'robot-game'];

  categories.forEach(category => {
    const categoryRanks = calculateTeamRanks(teams, category);
    categoryRanks.forEach((rank, teamId) => {
      const teamRanks = allRanksMap.get(teamId);
      if (teamRanks) {
        teamRanks[category] = rank;
      }
    });
  });

  return allRanksMap;
}

/**
 * Sorts teams by total rank with tiebreakers
 * 1. Total rank (lower is better)
 * 2. Core Values rank (lower is better)
 * 3. Team number (lower is better)
 */
export function sortByTotalRank(teams: DeliberationTeam[]): DeliberationTeam[] {
  return [...teams].sort((a, b) => {
    // Primary: Total rank
    let diff = a.totalRank - b.totalRank;
    if (diff !== 0) return diff;

    // Tiebreaker 1: Core Values rank
    diff = a.ranks['core-values'] - b.ranks['core-values'];
    if (diff !== 0) return diff;

    // Tiebreaker 2: Team number
    return a.number - b.number;
  });
}

/**
 * Finds teams that should be flagged as anomalies
 * Anomalies are teams ranked high in a category but low overall (or vice versa)
 */
export function findAnomalies(teams: DeliberationTeam[], threshold: number = 5): string[] {
  const anomalies: Set<string> = new Set();
  const totalRanks = sortByTotalRank(teams).map(t => t.id);

  teams.forEach(team => {
    const totalRankPosition = totalRanks.indexOf(team.id) + 1;

    // Check each judging category
    JUDGING_CATEGORIES.forEach(category => {
      const categoryRank = team.ranks[category];

      // If team is ranked high in category but low overall
      if (categoryRank <= threshold && totalRankPosition > threshold + 5) {
        anomalies.add(team.id);
      }

      // If team is ranked low in category but high overall
      if (totalRankPosition <= threshold && categoryRank > threshold + 5) {
        anomalies.add(team.id);
      }
    });
  });

  return Array.from(anomalies);
}
