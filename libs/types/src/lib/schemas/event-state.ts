import { ObjectId } from 'mongodb';
import { AudienceDisplayState } from '../constants';

interface AwardsPresentationState {
  enabled: false;
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
  awardsPresentation: AwardsPresentationState;
}
