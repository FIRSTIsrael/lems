import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface BlockedTimeSlot {
  start: string; // ISO 8601 time string (e.g., "12:00")
  end: string; // ISO 8601 time string (e.g., "12:30")
  reason?: string; // Optional reason (e.g., "Lunch break")
}

export interface PracticeTablesConfigTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  division_id: string; // UUID foreign key to divisions.id
  table_count: number; // Number of practice tables available
  slot_duration_minutes: number; // Duration of each practice slot in minutes
  start_time: string; // Start time in HH:MM format (e.g., "07:00")
  end_time: string; // End time in HH:MM format (e.g., "19:00")
  blocked_time_slots: BlockedTimeSlot[]; // JSONB array of blocked time slots
}

export type PracticeTablesConfig = Selectable<PracticeTablesConfigTable>;
export type InsertablePracticeTablesConfig = Insertable<PracticeTablesConfigTable>;
export type UpdateablePracticeTablesConfig = Updateable<PracticeTablesConfigTable>;
