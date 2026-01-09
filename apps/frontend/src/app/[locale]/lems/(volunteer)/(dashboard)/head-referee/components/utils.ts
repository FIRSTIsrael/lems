import type { Match, Scoresheet, ScoresheetStatus } from '../graphql/types';

export interface RoundGroup {
  stage: 'PRACTICE' | 'RANKING';
  round: number;
  matches: Match[];
  scoresheets: Scoresheet[];
  escalatedCount: number;
}

export interface FilterOptions {
  searchQuery: string;
  statusFilter: ScoresheetStatus[];
  showEscalatedOnly: boolean;
}

/**
 * Groups matches and scoresheets by stage and round.
 * Also calculates escalation count per round.
 */
export function groupByRound(matches: Match[], scoresheets: Scoresheet[]): RoundGroup[] {
  const groups = new Map<string, RoundGroup>();

  // Process matches
  matches.forEach(match => {
    const key = `${match.stage}-${match.round}`;
    if (!groups.has(key)) {
      groups.set(key, {
        stage: match.stage,
        round: match.round,
        matches: [],
        scoresheets: [],
        escalatedCount: 0
      });
    }
    groups.get(key)!.matches.push(match);
  });

  // Process scoresheets and count escalations
  scoresheets.forEach(scoresheet => {
    const key = `${scoresheet.stage}-${scoresheet.round}`;
    if (groups.has(key)) {
      const group = groups.get(key)!;
      group.scoresheets.push(scoresheet);
      if (scoresheet.escalated) {
        group.escalatedCount++;
      }
    }
  });

  // Convert to array and sort
  return Array.from(groups.values()).sort((a, b) => {
    // Practice rounds first, then ranking rounds
    if (a.stage !== b.stage) {
      return a.stage === 'PRACTICE' ? -1 : 1;
    }
    // Within same stage, sort by round number
    return a.round - b.round;
  });
}

/**
 * Filters scoresheets based on filter options.
 */
export function filterScoresheets(scoresheets: Scoresheet[], options: FilterOptions): Scoresheet[] {
  let filtered = scoresheets;

  // Filter by escalation status
  if (options.showEscalatedOnly) {
    filtered = filtered.filter(s => s.escalated);
  }

  // Filter by status
  if (options.statusFilter.length > 0) {
    filtered = filtered.filter(s => options.statusFilter.includes(s.status));
  }

  // Filter by search query (team number)
  if (options.searchQuery.trim()) {
    const query = options.searchQuery.trim();
    // Escape special regex characters to avoid errors
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    filtered = filtered.filter(
      s => regex.test(s.team.number) || (s.team.name && regex.test(s.team.name))
    );
  }

  return filtered;
}

/**
 * Filters matches based on scoresheets that passed the filter.
 * Only includes matches that have at least one filtered scoresheet.
 */
export function filterMatchesByScoresheets(
  matches: Match[],
  filteredScoresheets: Scoresheet[]
): Match[] {
  const filteredScoresheetIds = new Set(filteredScoresheets.map(s => `${s.stage}-${s.round}`));

  return matches.filter(match => {
    const matchKey = `${match.stage}-${match.round}`;
    return filteredScoresheetIds.has(matchKey);
  });
}

/**
 * Gets all escalated scoresheets sorted by stage and round.
 */
export function getEscalatedScoresheets(scoresheets: Scoresheet[]): Scoresheet[] {
  return scoresheets
    .filter(s => s.escalated)
    .sort((a, b) => {
      // Practice first, then ranking
      if (a.stage !== b.stage) {
        return a.stage === 'PRACTICE' ? -1 : 1;
      }
      // Then by round
      if (a.round !== b.round) {
        return a.round - b.round;
      }
      // Finally by team number
      return a.team.number.localeCompare(b.team.number);
    });
}

/**
 * Finds the scoresheet for a given team in a specific match.
 */
export function findScoresheetForTeam(
  scoresheets: Scoresheet[],
  teamId: string,
  stage: string,
  round: number
): Scoresheet | undefined {
  return scoresheets.find(s => s.team.id === teamId && s.stage === stage && s.round === round);
}
