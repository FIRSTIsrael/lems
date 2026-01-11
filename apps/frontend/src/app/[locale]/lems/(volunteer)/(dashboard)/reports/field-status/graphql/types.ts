export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';
export interface MatchParticipant {
  id: string;
  team: {
    id: string;
    name: string;
    number: number;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
  ready: boolean;
  matchId: string;
}

export interface Match {
  id: string;
  slug: string;
  stage: MatchStage;
  round: number;
  number: number;
  scheduledTime: string;
  status: MatchStatus;
  called: boolean;
  startTime: string | null;
  startDelta: number | null;
  participants: MatchParticipant[];
}

export interface Table {
  id: string;
  name: string;
}

export interface Division {
  id: string;
  name: string;
  color: string;
  tables: Table[];
}

export interface Field {
  divisionId: string;
  matchLength: number;
  loadedMatch: string | null;
  activeMatch: string | null;
  currentStage: MatchStage;
  matches: Match[];
}


export interface FieldStatusData {
  division: Division & {
    field: Field;
  };
}

export interface FieldStatusVars {
  divisionId: string;
}

// Event types for subscriptions
export interface MatchEvent {
  matchId: string;
  startTime?: string;
  startDelta?: number;
  autoLoadedMatchId?: string;
}


export interface ParticipantStatusEvent {
  participantId: string;
  present: string | null;
  ready: string | null;
}
