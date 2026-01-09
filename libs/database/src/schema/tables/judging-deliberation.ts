import type { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type DeliberationStatus = 'not-started' | 'in-progress' | 'completed';

export interface JudgingDeliberationsTable {
  id: Generated<string>;
  division_id: string;
  category: string;
  status: DeliberationStatus;
  start_time: Date | null;
  picklist: string[]; // Array of team IDs
}

export type JudgingDeliberation = Selectable<JudgingDeliberationsTable>;
export type NewJudgingDeliberation = Insertable<JudgingDeliberationsTable>;
export type JudgingDeliberationUpdate = Updateable<JudgingDeliberationsTable>;
