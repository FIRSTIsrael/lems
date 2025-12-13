export type ScoresheetStatus = 'empty' | 'draft' | 'completed' | 'gp' | 'submitted';

interface MissionClause {
  type: 'boolean' | 'enum' | 'number';
  value: boolean | string | number | null;
}

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
     * Format: { [missionId: string]: Array<MissionClause> }
     * Each mission clause contains a type and a corresponding value.
     *
     * @example
     * {
     * "mission1": [{ type: 'boolean', value: true }, { type: 'number', value: 5 }],
     * "mission2": [{ type: 'enum', value: 'option1' }]
     * }
     */
    missions: Record<string, Array<MissionClause>>;

    /**
     * Signature data as encoded PNG string.
     */
    signature?: string;

    gp?: { value: 2 | 3 | 4 | null; notes?: string };
    score: number;
  };
}
