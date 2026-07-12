export interface Team {
  id: string;
  number: string;
  name: string;
  arrived: boolean;
}

export interface RobotGameTable {
  id: string;
  name: string;
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
  number: number;
  stage: string;
  status: string;
  scheduledTime: string;
  startTime?: string;
  called: boolean;
  participants: MatchParticipant[];
}

export interface JudgingRoom {
  id: string;
  name: string;
}

export interface JudgingSession {
  id: string;
  number: number;
  teamId: string;
  roomId: string;
  scheduledTime: string;
  status: string;
  called: boolean;
  queued: boolean;
}

export interface HeadQueuerData {
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
}
