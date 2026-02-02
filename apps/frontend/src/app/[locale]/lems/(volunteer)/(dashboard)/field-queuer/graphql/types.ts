export interface RobotGameTable {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  arrived: boolean;
}

export interface MatchParticipant {
  id: string;
  team: Team | null;
  table: RobotGameTable | null;
  queued: boolean;
  present: boolean;
  ready: boolean;
}

export interface RobotGameMatch {
  id: string;
  stage: string;
  number: number;
  scheduledTime: string;
  startTime: string | null;
  status: string;
  called: boolean;
  participants: MatchParticipant[];
}

export interface JudgingSession {
  id: string;
  status: string;
  called: boolean;
  team: Team | null;
}

export interface FieldQueuerData {
  matches: RobotGameMatch[];
  sessions: JudgingSession[];
  loadedMatch: RobotGameMatch | null;
}
