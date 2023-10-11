import { ObjectId, WithId } from 'mongodb';
import { RobotGameMatchStage, RobotGameMatchStatus, RobotGameMatchPresent } from '../constants';
import { Team } from './team';

export interface RobotGameMatchBrief {
  eventId: ObjectId;
  round: number;
  number: number;
  stage: RobotGameMatchStage;
  status: RobotGameMatchStatus;
  scheduledTime?: Date;
  startTime?: Date;
}

export interface RobotGameMatchParticipant {
  teamId: ObjectId;
  team?: WithId<Team>;
  tableId: ObjectId;
  tableName?: string;
  present: RobotGameMatchPresent;
  ready: boolean;
}

export interface RobotGameMatch extends RobotGameMatchBrief {
  participants: Array<RobotGameMatchParticipant>;
}
