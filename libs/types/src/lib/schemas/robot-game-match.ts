import { ObjectId } from 'mongodb';
import { RobotGameMatchType, Status } from '../constants';

export interface RobotGameMatch {
  number: number;
  type: RobotGameMatchType;
  round: number;
  time: Date;
  team: ObjectId;
  table: ObjectId;
  status: Status;
  ready: boolean;
  start?: Date;
}
