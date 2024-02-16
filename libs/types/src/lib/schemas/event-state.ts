import { ObjectId } from 'mongodb';
import { AudienceDisplayScreen } from '../constants';

export interface PresentationState {
  enabled: boolean;
  activeView: {
    slideIndex: number;
    stepIndex: number;
  };
}

export interface AudienceDisplayState {
  screen: AudienceDisplayScreen;
  message: string;
}

export interface EventState {
  eventId: ObjectId;
  loadedMatch: ObjectId | null;
  activeMatch: ObjectId | null;
  currentStage: 'practice' | 'ranking';
  currentRound: number;
  currentSession: number;
  audienceDisplay: AudienceDisplayState;
  presentations: { [key: string]: PresentationState };
  completed: boolean;
}
