import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface RobotGameTablesTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  division_id: string; // UUID foreign key to divisions.id
  pair_key: string; // UUID shared by the two tables of a pair
  side: 'A' | 'B'; // Side within the pair, unique per pair_key
}

export type RobotGameTable = Selectable<RobotGameTablesTable>;
export type InsertableRobotGameTable = Insertable<RobotGameTablesTable>;
export type UpdateableRobotGameTable = Updateable<RobotGameTablesTable>;
