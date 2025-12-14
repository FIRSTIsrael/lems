export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';

export interface MatchParticipant {
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

export interface ScorekeeperData {
  division: {
    id: string;
    field: {
      matches: Match[];
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
  version: number;
  startTime?: string;
  startDelta?: number;
}
