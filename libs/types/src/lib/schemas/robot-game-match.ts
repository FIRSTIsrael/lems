import { ObjectId } from 'mongodb';

export interface RobotGameMatch {
  start: Date;
  team: ObjectId;
  table: ObjectId;
}
