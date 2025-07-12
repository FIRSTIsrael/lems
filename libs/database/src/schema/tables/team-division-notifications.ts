import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface TeamDivisionNotificationsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  team_at_division_id: number; // Foreign key to team_divisions.pk
  phone_number: string; // VARCHAR(32)
  active: Generated<boolean>; // Default true
}

export type TeamDivisionNotification = Selectable<TeamDivisionNotificationsTable>;
export type InsertableTeamDivisionNotification = Insertable<TeamDivisionNotificationsTable>;
export type UpdateableTeamDivisionNotification = Updateable<TeamDivisionNotificationsTable>;
