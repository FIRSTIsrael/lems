export type { Team, Table, Room, Match, MatchParticipant, JudgingSession } from './types-base';

import type { Match, JudgingSession, Team, Table, Room } from './types-base';

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
