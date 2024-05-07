import { ObjectId } from 'mongodb';

export interface RobotGameTable {
  name: string;
  divisionId: ObjectId;
}
