import { ObjectId } from 'mongodb';
import { RobotGameMatchType, RobotGameMatchStatus, RobotGameMatchPresent } from '../constants';
import { Team } from './team';

export interface RobotGameMatchBrief {
  eventId: ObjectId;
  number: number;
  type: RobotGameMatchType;
  status: RobotGameMatchStatus;
  scheduledTime?: Date;
  startTime?: Date;
}

interface RobotGameMatchParticipant {
  teamId: ObjectId;
  team?: Team;
  tableId: ObjectId;
  tableName?: string;
  round: number;
  present: RobotGameMatchPresent;
  ready: boolean;
}

export interface RobotGameMatch extends RobotGameMatchBrief {
  participants: RobotGameMatchParticipant[];
}
