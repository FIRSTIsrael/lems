import { ObjectId } from 'mongodb';

export interface JudgingSession {
  number: number;
  start: Date;
  team: ObjectId;
  room: ObjectId;
}
