import { ObjectId } from 'mongodb';

export interface EventState {
  event: ObjectId;
  currentMatch: number;
  loadedMatch: number | null;
  activeMatch: number | null;
  currentSession: number;
  activeSession: number | null;
  // TODO: make this hold the current running session if any
  // this should be implemented on the backend in the WS start abort complete routes
}
