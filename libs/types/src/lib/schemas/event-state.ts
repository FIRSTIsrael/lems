import { ObjectId } from 'mongodb';

export interface EventState {
  event: ObjectId;
  activeMatch: number;
  activeSession: number;
}
