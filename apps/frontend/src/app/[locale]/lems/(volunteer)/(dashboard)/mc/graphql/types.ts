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
    arrived: boolean;
  } | null;
  table: {
    id: string;
    name: string;
  };
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

export interface McData {
  division: {
    id: string;
    field: {
      matches: Match[];
      currentStage: MatchStage;
      loadedMatch: string | null;
    };
  };
}

export interface McVars {
  divisionId: string;
}

export interface ParsedMcData {
  matches: Match[];
  currentStage: MatchStage;
  loadedMatch: string | null;
}

export interface MatchEvent {
  matchId: string;
  match?: Match;
}
