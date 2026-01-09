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
  innovation_project: { id: string; status: RubricStatus } | null;
  robot_design: { id: string; status: RubricStatus } | null;
  core_values: { id: string; status: RubricStatus } | null;
}

export interface Deliberation {
  id: string;
  category: string;
  status: string;
  startTime?: string;
  picklist: unknown[];
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

export interface LeadJudgeData {
  sessions: JudgingSession[];
  rooms: Room[];
  sessionLength: number;
  deliberation: Deliberation | null;
}

export interface QueryData {
  division?: { id: string; judging: LeadJudgeData } | null;
}

export interface QueryVars {
  divisionId: string;
}

export interface SubscriptionVars {
  divisionId: string;
}
