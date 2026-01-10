import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface DivisionScheduleSettings {
  match_length: number;
  practice_cycle_time: number;
  ranking_cycle_time: number;
  judging_session_length: number;
  judging_session_cycle_time: number;
}

export interface DivisionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  event_id: string; // UUID foreign key to events.id
  color: string;
  pit_map_url: string | null;
  has_schedule: Generated<boolean>; // Default false
  has_awards: Generated<boolean>; // Default false
  has_users: Generated<boolean>; // Default false
  awards_assigned: Generated<boolean>; // Default false
  schedule_settings: DivisionScheduleSettings | null;
}

export type Division = Selectable<DivisionsTable>;
export type InsertableDivision = Insertable<DivisionsTable>;
export type UpdateableDivision = Updateable<DivisionsTable>;

// Utility types

export interface DivisionSummary extends Division {
  team_count: number;
}
