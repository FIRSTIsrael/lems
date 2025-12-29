export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';
export type ScoresheetStatus = 'empty' | 'draft' | 'completed' | 'gp' | 'submitted';

export interface MatchParticipant {
  id: string;
  team: {
    id: string;
    name: string;
    number: number;
    affiliation: string;
    city: string;
    logoUrl?: string;
  } | null;
  table: {
    id: string;
    name: string;
  };
}

export interface Match {
  id: string;
  stage: MatchStage;
  round: number;
  number: number;
  status: MatchStatus;
  participants: MatchParticipant[];
  startTime: string | null;
}

export type ScoresheetMissionClauseUpdatedEvent = {
  __typename: 'ScoresheetMissionClauseUpdated';
  scoresheetId: string;
  missionId: string;
  score: number;
};

export type ScoresheetStatusUpdatedEvent = {
  __typename: 'ScoresheetStatusUpdated';
  scoresheetId: string;
  status: string;
};

export type ScoresheetEscalatedUpdatedEvent = {
  __typename: 'ScoresheetEscalatedUpdated';
  scoresheetId: string;
  escalated: boolean;
};

export type ScoresheetUpdatedEvent =
  | ScoresheetMissionClauseUpdatedEvent
  | ScoresheetStatusUpdatedEvent
  | ScoresheetEscalatedUpdatedEvent;

export interface Scoresheet {
  id: string;
  team: { id: string };
  stage: MatchStage;
  round: number;
  status: ScoresheetStatus;
  escalated: boolean;
  data: { score: number } | null;
}

export interface ScoreboardVars {
  divisionId: string;
}

export interface FieldData {
  matches: Match[];
  scoresheets: Scoresheet[];
  currentStage: MatchStage;
  loadedMatch: string | null;
  activeMatch: string | null;
  matchLength: number;
}

export interface ScoreboardData {
  division: {
    id: string;
    field: FieldData;
  };
}

export interface MatchEvent {
  matchId: string;
  startTime?: string;
}
