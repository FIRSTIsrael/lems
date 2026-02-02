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
  team: Team;
  table: RobotGameTable;
  queued: boolean;
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

export interface HeadQueuerData {
  matches: RobotGameMatch[];
  tables: RobotGameTable[];
  activeMatch: RobotGameMatch | null;
  loadedMatch: RobotGameMatch | null;
}
