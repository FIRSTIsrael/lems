import { ObjectId } from 'mongodb';

export interface RobotGameTable {
  name: string;
  event: ObjectId;
}
