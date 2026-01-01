export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';

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
  participants: MatchParticipant[];
}

export interface MatchPreviewVars {
  divisionId: string;
  matchId: string;
}

export interface MatchPreviewData {
  division: {
    id: string;
    field: {
      matches: Match[];
      loadedMatch: string | null;
    };
  };
}

export interface MatchEvent {
  matchId: string;
  startTime?: string;
  startDelta?: number;
}
