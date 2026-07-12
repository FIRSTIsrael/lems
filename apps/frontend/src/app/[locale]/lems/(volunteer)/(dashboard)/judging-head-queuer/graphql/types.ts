export interface Team {
  id: string;
  number: string;
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

export interface HeadQueuerData {
  sessions: JudgingSession[];
  rooms: JudgingRoom[];
  currentSessions: JudgingSession[];
  upcomingSessions: JudgingSession[];
}
