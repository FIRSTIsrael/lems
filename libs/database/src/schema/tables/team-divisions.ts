import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamDivisionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  team_id: string; // UUID foreign key to teams.id
  division_id: string; // UUID foreign key to divisions.id
  arrived: Generated<false>; // Default false
  profile_document_url: string | null; // Points to object storage
}

export type TeamDivision = Selectable<TeamDivisionsTable>;
export type InsertableTeamDivision = Insertable<TeamDivisionsTable>;
export type UpdateableTeamDivision = Updateable<TeamDivisionsTable>;
