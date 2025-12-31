export interface Room {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  slug: string;
  region: string;
  logoUrl?: string | null;
  arrived: boolean;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  room: Room;
  team: Team | null;
  startTime?: string;
  startDelta?: number;
}

export interface MatchParticipant {
  team: Team | null;
}

export interface RobotGameMatch {
  id: string;
  stage: string;
  status: string;
  called: boolean;
  participants: MatchParticipant[];
}

export interface FieldState {
  activeMatch: string | null;
  loadedMatch: string | null;
}

export interface JudgingStatusData {
  sessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
}

export interface QueryData {
  division?: {
    id: string;
    rooms: Room[];
    judging: JudgingStatusData;
    field: FieldState;
    matches: RobotGameMatch[];
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export interface SubscriptionVars {
  divisionId: string;
}
