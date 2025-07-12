import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamAffiliationsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  city: string;
  coordinates: string | null; // PostGIS point stored as string
}

export type TeamAffiliation = Selectable<TeamAffiliationsTable>;
export type InsertableTeamAffiliation = Insertable<TeamAffiliationsTable>;
export type UpdateableTeamAffiliation = Updateable<TeamAffiliationsTable>;
