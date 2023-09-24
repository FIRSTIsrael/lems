import { ObjectId, W, WithId } from 'mongodb';
import { RobotGameMatchType, RobotGameMatchStatus, RobotGameMatchPresent } from '../constants';
import { Team } from './team';

export interface RobotGameMatchBrief {
  number: number;
  type: RobotGameMatchType;
  eventId: ObjectId;
  status: RobotGameMatchStatus;
  scheduledTime?: Date;
  startTime?: Date;
}

export interface RobotGameMatch extends RobotGameMatchBrief {
  round: number;
  teamId: ObjectId;
  team?: Team;
  tableId: ObjectId;
  tableName?: string;
  present: RobotGameMatchPresent;
  ready: boolean;
}

export interface RobotGameMatchGroup extends RobotGameMatchBrief {
  teams: WithId<RobotGameMatch>[];
}
