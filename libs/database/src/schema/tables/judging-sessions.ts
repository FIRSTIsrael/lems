import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface JudgingSessionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  number: number;
  team_id: string | null; // UUID foreign key to teams.id, nullable for unoccupied sessions
  room_id: string; // UUID foreign key to judging_rooms.id
  division_id: string; // UUID foreign key to divisions.id
  scheduled_time: Date;
}

export type JudgingSession = Selectable<JudgingSessionsTable>;
export type InsertableJudgingSession = Insertable<JudgingSessionsTable>;
export type UpdateableJudgingSession = Updateable<JudgingSessionsTable>;
