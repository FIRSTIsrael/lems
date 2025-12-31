/**
 * Team eligibility calculation utilities for final deliberations
 */

import type { DeliberationTeam } from './types';
import { ADVANCEMENT_PERCENTAGE } from './constants';

/**
 * Checks if a team is eligible for the champions stage
 * Teams are eligible if they are in the top N% by total rank
 */
export function checkChampionsEligibility(
  team: DeliberationTeam,
  teams: DeliberationTeam[],
  disqualifiedTeamIds: string[],
  advancementPercent: number = ADVANCEMENT_PERCENTAGE
): boolean {
  const advancingCount = Math.round(teams.length * advancementPercent);

  const eligibleTeams = teams
    .filter(t => !disqualifiedTeamIds.includes(t.id))
    .sort((a, b) => {
      // Primary sort: total rank
      let diff = a.totalRank - b.totalRank;
      if (diff !== 0) return diff;

      // Tiebreaker 1: Core Values rank
      diff = a.ranks['core-values'] - b.ranks['core-values'];
      if (diff !== 0) return diff;

      // Tiebreaker 2: Team number (lower is better)
      return a.number - b.number;
    })
    .slice(0, advancingCount);

  return eligibleTeams.some(t => t.id === team.id);
}

/**
 * Checks if a team is eligible for the core awards stage
 * Teams are eligible if they are ranked within the picklist limit for ANY category
 */
export function checkCoreAwardsEligibility(team: DeliberationTeam, picklistLimit: number): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { 'robot-game': _, ...categoryRanks } = team.ranks;
  return Object.values(categoryRanks).some(rank => (rank as number) <= picklistLimit);
}

/**
 * Checks if a team is eligible for the optional awards stage
 * Teams are eligible if they have any optional award nominations
 */
export function checkOptionalAwardsEligibility(
  team: DeliberationTeam,
  availableAwards: string[]
): boolean {
  return Object.entries(team.optionalAwardNominations || {}).some(
    ([awardName, hasNomination]) => availableAwards.includes(awardName) && hasNomination
  );
}

/**
 * Gets the default picklist limit based on number of teams
 * This determines how many teams can be considered for core awards
 */
export function getDefaultPicklistLimit(teamCount: number): number {
  if (teamCount <= 8) return 4;
  if (teamCount <= 16) return 6;
  if (teamCount <= 24) return 8;
  return Math.ceil(teamCount * 0.33); // ~33% for larger divisions
}

/**
 * Filters teams based on stage-specific eligibility rules
 */
export function getEligibleTeams(
  teams: DeliberationTeam[],
  stage: string,
  disqualifiedTeamIds: string[],
  manualEligibility: string[] = [],
  advancementPercent: number = ADVANCEMENT_PERCENTAGE,
  availableAwards: string[] = []
): DeliberationTeam[] {
  const picklistLimit = getDefaultPicklistLimit(teams.length);

  return teams.filter(team => {
    // Manually added teams are always eligible
    if (manualEligibility.includes(team.id)) {
      return true;
    }

    // Disqualified teams are never eligible (unless manually added)
    if (disqualifiedTeamIds.includes(team.id)) {
      return false;
    }

    switch (stage) {
      case 'champions':
        return checkChampionsEligibility(team, teams, disqualifiedTeamIds, advancementPercent);

      case 'core-awards':
        return checkCoreAwardsEligibility(team, picklistLimit);

      case 'optional-awards':
        return checkOptionalAwardsEligibility(team, availableAwards);

      default:
        return true; // Review stage - show all teams
    }
  });
}
