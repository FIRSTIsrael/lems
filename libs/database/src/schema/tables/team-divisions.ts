import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamDivisionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  team_id: string; // UUID foreign key to teams.id
  division_id: string; // UUID foreign key to divisions.id
  arrived: Generated<false>; // Default false
  arrived_at: Date | null; // Timestamp when team arrived
  profile_document_url: string | null; // Points to object storage
  disqualified: Generated<false>; // Default false
}

export type TeamDivision = Selectable<TeamDivisionsTable>;
export type InsertableTeamDivision = Insertable<TeamDivisionsTable>;
export type UpdateableTeamDivision = Updateable<TeamDivisionsTable>;
