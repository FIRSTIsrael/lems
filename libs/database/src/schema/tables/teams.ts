import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string; // VARCHAR(64)
  number: number; // int, unique
  affiliation: string;
  city: string;
  coordinates: string | null; // PostGIS point stored as string
  logo_url: string | null; // URL to team logo, optional
}

export type Team = Selectable<TeamsTable>;
export type InsertableTeam = Insertable<TeamsTable>;
export type UpdateableTeam = Updateable<TeamsTable>;
