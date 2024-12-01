import { ObjectId, WithId } from 'mongodb';
import { RobotGameMatchStage, RobotGameMatchStatus, RobotGameMatchPresent } from '../constants';
import { Team } from './team';

export interface RobotGameMatchBrief {
  divisionId: ObjectId;
  round: number;
  number: number;
  stage: RobotGameMatchStage;
  status: RobotGameMatchStatus;
  called: boolean;
  scheduledTime?: Date;
  startTime?: Date;
}

export interface RobotGameMatchParticipant {
  teamId: ObjectId | null;
  team?: WithId<Team>;
  tableId: ObjectId;
  tableName?: string;
  queued: boolean;
  present: RobotGameMatchPresent;
  ready: boolean;
}

export interface RobotGameMatch extends RobotGameMatchBrief {
  participants: Array<RobotGameMatchParticipant>;
}
