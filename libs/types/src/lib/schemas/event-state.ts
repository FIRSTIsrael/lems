import { ObjectId } from 'mongodb';
import { AudienceDisplayState } from '../constants';

export interface EventState {
  event: ObjectId;
  loadedMatch: ObjectId | null;
  activeMatch: ObjectId | null;
  currentStage: 'practice' | 'ranking';
  currentSession: number;
  audienceDisplayState: AudienceDisplayState;
}
