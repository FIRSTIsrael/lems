import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface JudgingRoomsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  division_id: string; // UUID foreign key to divisions.id
}

export type JudgingRoom = Selectable<JudgingRoomsTable>;
export type InsertableJudgingRoom = Insertable<JudgingRoomsTable>;
export type UpdateableJudgingRoom = Updateable<JudgingRoomsTable>;
