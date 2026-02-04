export interface Team {
  id: string;
  number: number;
  name: string;
  arrived: boolean;
}

export interface JudgingRoom {
  id: string;
  name: string;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  startTime?: string;
  status: string;
  called: boolean;
  queued: boolean;
  team: Team | null;
  room: JudgingRoom | null;
}

export interface RobotGameMatch {
  id: string;
  stage: string;
  number: number;
  scheduledTime: string;
  startTime: string | null;
  status: string;
  called: boolean;
}

export interface JudgingQueuerData {
  sessions: JudgingSession[];
  matches: RobotGameMatch[];
  rooms: JudgingRoom[];
}
