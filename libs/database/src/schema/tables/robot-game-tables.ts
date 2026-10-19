import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface RobotGameTablesTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  division_id: string; // UUID foreign key to divisions.id
  pair_key: ColumnType<string | null, string | null | undefined, string | null>; // Shared by both sides of one physical table
  side: ColumnType<'A' | 'B' | null, 'A' | 'B' | null | undefined, 'A' | 'B' | null>;
}

export type RobotGameTable = Selectable<RobotGameTablesTable>;
export type InsertableRobotGameTable = Insertable<RobotGameTablesTable>;
export type UpdateableRobotGameTable = Updateable<RobotGameTablesTable>;
