export interface Mission {
  id: string;
  clauses: Array<MissionClause>;
}

export type MissionClauseType = 'boolean' | 'enum' | 'number';

export interface MissionClause {
  type: MissionClauseType;
  value: boolean | string | number | null;
}
