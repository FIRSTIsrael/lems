import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';
import { DivisionSummary } from './divisions';

export interface EventsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  slug: string;
  start_date: Date;
  end_date: Date;
  location: string;
  region: string; // ISO 3166 alpha-2 country code (e.g., 'IL', 'US')
  coordinates: string | null; // PostGIS point stored as string
  season_id: string; // UUID foreign key to seasons.id
}

export type Event = Selectable<EventsTable>;
export type InsertableEvent = Insertable<EventsTable>;
export type UpdateableEvent = Updateable<EventsTable>;

// Utility types

export interface EventSummary {
  id: string;
  name: string;
  slug: string;
  date: string;
  location: string;
  region: string;
  coordinates: string | null;
  team_count: number;
  divisions: {
    id: string;
    name: string;
    color: string;
  }[];
  season_id: string;
  visible: boolean;
  published: boolean;
  completed: boolean;
  official: boolean;
  is_fully_set_up: boolean;
  assigned_admin_ids: string[];
}

export interface EventDetails {
  id: string;
  name: string;
  slug: string;
  start_date: Date;
  end_date: Date;
  location: string;
  region: string;
  coordinates: string | null;
  season_id: string;
  divisions: DivisionSummary[];
  season_name: string;
  season_slug: string;
  official: boolean;
}
