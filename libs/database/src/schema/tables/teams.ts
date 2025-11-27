import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string; // VARCHAR(64)
  number: number; // int, unique in combination with region
  affiliation: string;
  city: string;
  region: string; // ISO 3166 alpha-2 country code (e.g., 'IL', 'US')
  coordinates: string | null; // PostGIS point stored as string
  logo_url: string | null; // URL to team logo, optional
}

export type Team = Selectable<TeamsTable>;
export type InsertableTeam = Insertable<TeamsTable>;
export type UpdateableTeam = Updateable<TeamsTable>;

// Utility Types

export type TeamWithDivision = {
  id: string;
  number: number;
  name: string;
  logo_url: string | null;
  city: string;
  affiliation: string;
  region: string;
  coordinates: string | null;
  division_id: string;
  division_name: string;
  division_color: string;
};
