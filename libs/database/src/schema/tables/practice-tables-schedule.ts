import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface PracticeTablesScheduleTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  division_id: string; // UUID foreign key to divisions.id
  team_id: string | null; // UUID foreign key to teams.id (nullable - slot can be unassigned)
  table_number: number; // Table number (1-based)
  start_time: Date; // Start time of the practice slot
  end_time: Date; // End time of the practice slot
  created_at: ColumnType<Date, never, never>; // Timestamp when the assignment was created
}

export type PracticeTablesSchedule = Selectable<PracticeTablesScheduleTable>;
export type InsertablePracticeTablesSchedule = Insertable<PracticeTablesScheduleTable>;
export type UpdateablePracticeTablesSchedule = Updateable<PracticeTablesScheduleTable>;
