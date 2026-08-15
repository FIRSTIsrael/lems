import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';
import { RobotGameMatchParticipant } from './robot-game-match-participants';

export type RobotGameMatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type RobotGameMatchStatus = 'not-started' | 'in-progress' | 'completed';

export interface RobotGameMatchesTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  round: number;
  number: number;
  stage: RobotGameMatchStage;
  scheduled_time: Date;
  division_id: string; // UUID foreign key to divisions.id for easier querying
  status: Generated<RobotGameMatchStatus>;
  called: Generated<Date | null>; // Timestamp when the match was called, null if not called
  start_time: Generated<Date | null>; // Actual timestamp when the match was started
  start_delta: Generated<number | null>; // Seconds offset between scheduled and actual start time
}

export type RobotGameMatch = Selectable<RobotGameMatchesTable>;
export type InsertableRobotGameMatch = Insertable<RobotGameMatchesTable>;
export type UpdateableRobotGameMatch = Updateable<RobotGameMatchesTable>;

// Utility Types

export interface RobotGameMatchWithParticipants extends RobotGameMatch {
  participants: RobotGameMatchParticipant[];
}
