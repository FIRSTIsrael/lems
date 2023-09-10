import { ObjectId } from 'mongodb';
import { RobotGameMatchType, Status } from '../constants';

export interface RobotGameMatch {
  number: number;
  type: RobotGameMatchType;
  time: Date;
  team: ObjectId;
  table: ObjectId;
  status: Status;
  start?: Date;
}
