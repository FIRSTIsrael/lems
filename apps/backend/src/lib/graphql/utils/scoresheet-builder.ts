import { Scoresheet as DbScoresheet } from '@lems/database';
import { WithId } from 'mongodb';

/**
 * Generates a slug for a scoresheet based on its stage and round number.
 * Format: P<round> for PRACTICE, R<round> for RANKING
 * Examples: P1, P2, R1, R3
 *
 * @param stage - The stage (PRACTICE or RANKING)
 * @param round - The round number
 * @returns The slug string
 */
export function generateScoresheetSlug(stage: 'PRACTICE' | 'RANKING', round: number): string {
  const stagePrefix = stage.charAt(0).toUpperCase(); // 'P' or 'R'
  return `${stagePrefix}${round}`;
}

/**
 * GraphQL Scoresheet type for individual scoresheets.
 */
export interface ScoresheetGraphQL {
  id?: string; // MongoDB ObjectId or string
  divisionId: string;
  teamId: string;
  slug: string; // Generated from stage and round
  stage: string;
  round: number;
  status: string;
  escalated?: boolean;
  data?: {
    missions: Record<
      string,
      Array<{
        type: 'boolean' | 'enum' | 'number';
        value: boolean | string | number | null;
      }>
    >;
    signature?: string;
    gp?: { value: 2 | 3 | 4 | null; notes?: string };
    score: number;
  };
}

/**
 * Helper function to build a ScoresheetGraphQL object from a database scoresheet.
 */
export function buildScoresheetResult(scoresheet: WithId<DbScoresheet>): ScoresheetGraphQL {
  return {
    id: scoresheet._id?.toString(),
    divisionId: scoresheet.divisionId,
    teamId: scoresheet.teamId,
    slug: generateScoresheetSlug(scoresheet.stage as 'PRACTICE' | 'RANKING', scoresheet.round),
    stage: scoresheet.stage,
    round: scoresheet.round,
    status: scoresheet.status,
    escalated: scoresheet.escalated,
    data: scoresheet.data
  };
}
