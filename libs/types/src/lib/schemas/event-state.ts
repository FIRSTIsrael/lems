import { ObjectId } from 'mongodb';
import { AudienceDisplayState } from '../constants';

export interface PresentationState {
  enabled: boolean;
  activeView: {
    slideIndex: number;
    stepIndex: number;
  };
  pendingView: {
    slideIndex: number;
    stepIndex: number;
  };
}

export interface EventState {
  eventId: ObjectId;
  loadedMatch: ObjectId | null;
  activeMatch: ObjectId | null;
  currentStage: 'practice' | 'ranking';
  currentSession: number;
  audienceDisplayState: AudienceDisplayState;
  presentations: { [key: string]: PresentationState };
}
