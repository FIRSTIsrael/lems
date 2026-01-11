export interface Room {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  number: number;
  name: string;
  arrived: boolean;
}

export interface AgendaEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  room: Room;
  team: Team;
}

export interface QueryData {
  division?: {
    id: string;
    rooms: Room[];
    agenda: AgendaEvent[];
    judging: {
      sessionLength: number;
      sessions: JudgingSession[];
    };
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export interface ScheduleRow {
  type: 'session' | 'agenda';
  time: Date;
  rooms?: Array<{
    id: string;
    name: string;
    team: Team | null;
  }>;
  agendaEvent?: AgendaEvent;
}
