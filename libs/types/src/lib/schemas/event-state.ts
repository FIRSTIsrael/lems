import { ObjectId } from 'mongodb';

export interface EventState {
  event: ObjectId;
  activeMatch: number | null;
  loadedMatch: number | null;
  activeSession: number | null;
}
