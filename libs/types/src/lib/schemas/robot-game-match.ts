import { ObjectId } from 'mongodb';
import { RobotGameMatchType, RobotGameMatchStatus, RobotGameMatchPresent } from '../constants';
import { Team } from './team';

export interface RobotGameMatch {
  number: number;
  type: RobotGameMatchType;
  round: number;
  time: Date;
  teamId: ObjectId;
  team?: Team;
  tableId: ObjectId;
  eventId: ObjectId;
  status: RobotGameMatchStatus;
  present: RobotGameMatchPresent;
  ready: boolean;
  start?: Date;
}
