import { RubricStatus } from '@lems/database';

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
  region: string;
  slug: string;
  logoUrl?: string | null;
  arrived: boolean;
  location?: string;
  profileDocumentUrl?: string | null;
}

export interface CategorizedRubrics extends Record<
  string,
  { id: string; status: RubricStatus } | null
> {
  innovation_project: { id: string; status: RubricStatus } | null;
  robot_design: { id: string; status: RubricStatus } | null;
  core_values: { id: string; status: RubricStatus } | null;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  called: boolean;
  room: Room;
  team: Team;
  rubrics: CategorizedRubrics;
  startTime?: string;
  startDelta?: number;
}

export interface Judging {
  sessions: JudgingSession[];
  rooms: string[];
  sessionLength: number;
}

export interface QueryData {
  division?: { id: string; judging: Judging } | null;
}

export interface QueryVars {
  divisionId: string;
  roomId: string;
}

export interface SubscriptionVars {
  divisionId: string;
}
