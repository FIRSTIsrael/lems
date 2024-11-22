import { ObjectId } from 'mongodb';

export interface JudgingRoom {
  name: string;
  divisionId: ObjectId;
}
