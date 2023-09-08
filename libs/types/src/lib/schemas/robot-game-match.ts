import { ObjectId } from 'mongodb';
import { RobotGameMatchType } from '../constants';

export interface RobotGameMatch {
  number: number;
  type: RobotGameMatchType;
  start: Date;
  team: ObjectId;
  table: ObjectId;
}
