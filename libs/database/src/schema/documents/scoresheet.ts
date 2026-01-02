type ScoresheetClauseValue = number | boolean | string | string[] | null;

export type ScoresheetStatus = 'empty' | 'draft' | 'completed' | 'gp' | 'submitted';

export interface Scoresheet {
  divisionId: string;
  teamId: string;
  stage: 'PRACTICE' | 'RANKING';
  round: number;
  status: ScoresheetStatus;
  escalated?: boolean;
  data?: {
    /**
     * Mission clause values.
     * Format: { [missionId: string]: { [clauseIndex: number]: boolean | string | number | null } }
     * Each mission clause contains a corresponding value.
     *
     * @example
     * {
     * "mission1": { 0: true, 1: 5 },
     * "mission2": { 0: 'option1' }
     * }
     */
    missions: Record<string, Record<number, ScoresheetClauseValue>>;

    /**
     * Signature data as encoded PNG string.
     */
    signature?: string;

    gp?: { value: 2 | 3 | 4 | null; notes?: string };
    score: number;
  };
}
