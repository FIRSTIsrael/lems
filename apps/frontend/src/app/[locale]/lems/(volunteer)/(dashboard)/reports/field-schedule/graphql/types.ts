export interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
}

export interface RobotGameTable {
  id: string;
  name: string;
}

export interface RobotGameMatchParticipant {
  id: string;
  team: {
    id: string;
    number: number;
    name: string;
  } | null;
  table: {
    id: string;
    name: string;
  };
  present: string | null;
  queued: string | null;
  ready: string | null;
}

export interface RobotGameMatch {
  id: string;
  slug: string;
  stage: 'PRACTICE' | 'RANKING' | 'TEST';
  round: number;
  number: number;
  scheduledTime: string;
  status: 'not-started' | 'in-progress' | 'completed';
  called: boolean;
  participants: RobotGameMatchParticipant[];
}

export interface AgendaEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
}

export interface QueryVars {
  divisionId: string;
}

export interface QueryData {
  division: {
    id: string;
    teams: Team[];
    tables: RobotGameTable[];
    agenda: AgendaEvent[];
    field: {
      matches: RobotGameMatch[];
    };
  };
}

export interface ParsedFieldScheduleData {
  teams: Team[];
  tables: RobotGameTable[];
  matches: RobotGameMatch[];
  agendaEvents: AgendaEvent[];
}
