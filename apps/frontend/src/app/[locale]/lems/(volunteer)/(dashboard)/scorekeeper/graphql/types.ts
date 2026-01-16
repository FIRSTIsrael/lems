import { AwardsPresentation } from '@lems/database';

export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';
export type AudienceDisplayScreen =
  | 'scoreboard'
  | 'match_preview'
  | 'sponsors'
  | 'logo'
  | 'message'
  | 'awards';

export interface TeamWinner {
  team: {
    id: string;
    name: string;
    number: string;
    city: string;
    affiliation: string;
  };
}

export interface PersonalWinner {
  name: string;
}

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  winner?: TeamWinner | PersonalWinner | null;
}

export interface MatchParticipant {
  id: string;
  team: {
    id: string;
    name: string;
    number: number;
    affiliation: string;
    city: string;
    arrived: boolean;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
  ready: boolean;
}

export interface Match {
  id: string;
  slug: string;
  stage: MatchStage;
  round: number;
  number: number;
  scheduledTime: string;
  startTime: string | null;
  status: MatchStatus;
  participants: MatchParticipant[];
}

export interface AudienceDisplayState {
  activeDisplay: AudienceDisplayScreen;
  awardsPresentation: AwardsPresentation;
  settings?: Record<AudienceDisplayScreen, Record<string, unknown>>;
}

export interface ScorekeeperData {
  division: {
    id: string;
    awardsAssigned: boolean;
    field: {
      matches: Match[];
      audienceDisplay: AudienceDisplayState | null;
      currentStage: MatchStage;
      loadedMatch: string | null;
      activeMatch: string | null;
      matchLength: number;
    };
    judging: {
      awards: Award[];
    };
  };
}

export interface ScorekeeperVars {
  divisionId: string;
}

export interface MatchEvent {
  matchId: string;
  startTime?: string;
  startDelta?: number;
}
