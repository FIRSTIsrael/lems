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
  slug: string;
  region: string;
  logoUrl?: string | null;
  arrived: boolean;
}

export interface CategorizedRubrics extends Record<
  string,
  { id: string; status: RubricStatus } | null
> {
  innovationProject: { id: string; status: RubricStatus } | null;
  robotDesign: { id: string; status: RubricStatus } | null;
  coreValues: { id: string; status: RubricStatus } | null;
}

export interface JudgingSession {
  id: string;
  number: number;
  scheduledTime: string;
  status: string;
  room: Room;
  team: Team;
  rubrics: CategorizedRubrics;
  startTime?: string;
  startDelta?: number;
}

export interface JudgeAdvisorData {
  sessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
}

export interface QueryData {
  division?: { id: string; judging: JudgeAdvisorData } | null;
}

export interface QueryVars {
  divisionId: string;
}

export interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}
