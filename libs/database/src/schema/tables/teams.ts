import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string; // VARCHAR(64)
  number: number; // int, unique
  affiliation_id: string; // UUID foreign key to team_affiliations.id
}

export type Team = Selectable<TeamsTable>;
export type InsertableTeam = Insertable<TeamsTable>;
export type UpdateableTeam = Updateable<TeamsTable>;
