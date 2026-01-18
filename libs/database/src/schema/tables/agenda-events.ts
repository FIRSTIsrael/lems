import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface AgendaEventsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  division_id: string; // UUID foreign key to divisions.id
  title: string;
  start_time: Date;
  duration: number; // Duration in minutes
  visibility: string; // e.g., 'public', 'private', 'judges-only'
  location: string | null; // Optional location for the agenda event
}

export type AgendaEvent = Selectable<AgendaEventsTable>;
export type InsertableAgendaEvent = Insertable<AgendaEventsTable>;
export type UpdateableAgendaEvent = Updateable<AgendaEventsTable>;
