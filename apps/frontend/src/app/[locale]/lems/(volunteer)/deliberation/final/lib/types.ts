/**
 * Type definitions for final deliberations
 */

export interface TeamRanks {
  'innovation-project': number;
  'robot-design': number;
  'core-values': number;
  'robot-game': number;
}

export interface TeamScores {
  'innovation-project': number;
  'robot-design': number;
  'core-values': number;
  'robot-game': number;
}

export interface OptionalAwardNominations {
  [awardName: string]: boolean;
}

/**
 * Enriched team data for deliberations with calculated fields
 */
export interface DeliberationTeam {
  id: string;
  number: number;
  name: string;
  affiliation: string;

  // Scores (normalized 0-1 or 0-100 depending on category)
  scores: TeamScores;

  // Rankings (1 = best)
  ranks: TeamRanks;

  // Total rank across all judging categories
  totalRank: number;

  // Robot game specific data
  gpScores: number[];
  highestGpScore: number;
  avgGpScore: number;
  robotConsistency: number; // Relative standard deviation

  // Optional award nominations from rubrics
  optionalAwardNominations: OptionalAwardNominations;

  // Flags
  disqualified: boolean;
  arrived: boolean;
}

export interface FinalDeliberationData {
  divisionId: string;
  stage: string;
  status: string;
  startTime: string | null;
  completionTime: string | null;
  champions: {
    '1'?: string;
    '2'?: string;
    '3'?: string;
    '4'?: string;
  };
  innovationProject: string[];
  robotDesign: string[];
  coreValues: string[];
  robotPerformance: string[];
  optionalAwards: Record<string, string[]>;
  coreAwardsManualEligibility: string[];
  optionalAwardsManualEligibility: string[];
}
