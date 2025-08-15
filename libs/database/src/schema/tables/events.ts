import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface EventsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  slug: string;
  start_date: Date;
  end_date: Date;
  location: string;
  coordinates: string | null; // PostGIS point stored as string
  season_id: string; // UUID foreign key to seasons.id
}

export type Event = Selectable<EventsTable>;
export type InsertableEvent = Insertable<EventsTable>;
export type UpdateableEvent = Updateable<EventsTable>;
