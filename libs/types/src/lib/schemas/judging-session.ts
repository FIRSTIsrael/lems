import { ObjectId } from 'mongodb';

export interface JudgingSession {
  start: Date;
  team: ObjectId;
  room: ObjectId;
}
