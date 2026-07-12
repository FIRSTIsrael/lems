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

export interface TeamInfo {
  id: string;
  name: string;
  number: number;
  affiliation?: string;
  city?: string;
  region: string;
}

export type AwardWinner =
  | { __typename: 'TeamWinner'; team: TeamInfo }
  | { __typename: 'PersonalWinner'; name: string }
  | null;

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: string;
  description?: string;
  showPlaces: boolean;
  winner: AwardWinner;
}

export interface McData {
  division: {
    id: string;
    awardsAssigned: boolean;
    judging: {
      awards: Award[];
      advancementPercentage: number | null;
    };
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
  awardsAssigned: boolean;
  awards: Award[];
  isAdvancementEnabled: boolean;
}

export interface MatchEvent {
  matchId: string;
  match?: Match;
}
