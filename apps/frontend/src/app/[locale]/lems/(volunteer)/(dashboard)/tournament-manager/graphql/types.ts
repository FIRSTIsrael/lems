export interface Team {
  id: string;
  number: number;
  name: string;
  slug: string;
  affiliation?: string;
  city?: string;
}

export interface Table {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface MatchParticipant {
  id: string;
  team: Team | null;
  table: Table;
}

export interface Match {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  participants: MatchParticipant[];
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  room: Room;
  team: Team | null;
}

export interface TournamentManagerData {
  division: {
    id: string;
    name: string;
    teams: Team[];
    tables: Table[];
    rooms: Room[];
    field: {
      divisionId: string;
      matches: Match[];
      loadedMatch: string | null;
      activeMatch: string | null;
    };
    judging: {
      divisionId: string;
      sessionLength: number;
      sessions: JudgingSession[];
    };
  };
}

export interface TournamentManagerVars {
  divisionId: string;
}

export interface QueryData {
  division?: TournamentManagerData['division'] | null;
}

export interface SubscriptionVars {
  divisionId: string;
}

export interface SwapMatchTeamsVars {
  divisionId: string;
  matchId: string;
  participantId1: string;
  participantId2: string;
}

export interface SwapSessionTeamsVars {
  divisionId: string;
  sessionId1: string;
  sessionId2: string;
}

export type MatchStatus = 'not-started' | 'in-progress' | 'completed';
export type SessionStatus = 'not-started' | 'in-progress' | 'completed';
export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
