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
  disqualified: boolean;
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
}

export interface ParsedJudgeAdvisorData {
  sessions: JudgingSession[];
  sessionLength: number;
}
