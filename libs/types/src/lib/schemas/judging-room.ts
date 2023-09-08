import { ObjectId } from 'mongodb';

export interface JudgingRoom {
  name: string;
  event: ObjectId;
}
