import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export type RobotGameMatchStage = 'PRACTICE' | 'RANKING' | 'TEST';

export interface RobotGameMatchesTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  round: number;
  number: number;
  stage: RobotGameMatchStage;
  scheduled_time: Date;
  division_id: string; // UUID foreign key to divisions.id for easier querying
}

export type RobotGameMatch = Selectable<RobotGameMatchesTable>;
export type InsertableRobotGameMatch = Insertable<RobotGameMatchesTable>;
export type UpdateableRobotGameMatch = Updateable<RobotGameMatchesTable>;
