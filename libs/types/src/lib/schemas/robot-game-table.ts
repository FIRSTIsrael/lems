import { ObjectId } from 'mongodb';

export interface RobotGameTable {
  name: string;
  eventId: ObjectId;
}
