import { ObjectId } from 'mongodb';

export interface EventState {
  event: ObjectId;
  loadedMatch: ObjectId | null;
  activeMatch: ObjectId | null;
  currentStage: 'practice' | 'ranking';
  currentSession: number;
}
