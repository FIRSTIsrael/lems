import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface RobotGameMatchParticipantsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, string, string>; // UUID unique identifier
  team_id: string | null; // UUID foreign key to teams.id, nullable for unoccupied tables
  table_id: string; // UUID foreign key to robot_game_tables.id
  match_id: string; // UUID foreign key to robot_game_matches.id
}

export type RobotGameMatchParticipant = Selectable<RobotGameMatchParticipantsTable>;
export type InsertableRobotGameMatchParticipant = Insertable<RobotGameMatchParticipantsTable>;
export type UpdateableRobotGameMatchParticipant = Updateable<RobotGameMatchParticipantsTable>;
