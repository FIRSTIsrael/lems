export interface Team {
  id: string;
  number: number;
  name: string;
  slug: string;
  affiliation?: string;
  city?: string;
}

export interface Table {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface MatchParticipant {
  id: string;
  team: Team | null;
  table: Table;
}

export interface Match {
  id: string;
  slug: string;
  stage: string;
  round: number;
  number: number;
  scheduledTime: string;
  status: string;
  participants: MatchParticipant[];
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  room: Room;
  team: Team | null;
}
