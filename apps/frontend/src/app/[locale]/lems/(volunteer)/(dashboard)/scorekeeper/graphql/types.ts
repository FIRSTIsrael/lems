export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';
export type AudienceDisplayScreen =
  | 'scoreboard'
  | 'match_preview'
  | 'sponsors'
  | 'logo'
  | 'message'
  | 'awards';

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
