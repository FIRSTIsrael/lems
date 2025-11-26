import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface RobotGameTablesTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  division_id: string; // UUID foreign key to divisions.id
}

export type RobotGameTable = Selectable<RobotGameTablesTable>;
export type InsertableRobotGameTable = Insertable<RobotGameTablesTable>;
export type UpdateableRobotGameTable = Updateable<RobotGameTablesTable>;
