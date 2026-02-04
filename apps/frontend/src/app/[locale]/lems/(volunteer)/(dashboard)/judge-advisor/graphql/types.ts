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

export interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: string; // 'PERSONAL' | 'TEAM'
  isOptional: boolean;
  allowNominations: boolean;
  automaticAssignment: boolean;
  winner?: AwardWinner | null;
}

export type AwardWinner = PersonalWinner | TeamWinner;

export interface PersonalWinner {
  name: string;
}

export interface TeamWinner {
  team: Team;
}

export interface JudgingDeliberation {
  id: string;
  category: string;
  status: string; // 'not-started' | 'in-progress' | 'completed'
  startTime?: string;
  picklist: string[];
}

export interface FinalDeliberation {
  divisionId: string;
  stage: string; // 'not-started' | 'champions' | 'core-awards' | 'optional-awards' | 'review'
  status: string; // 'not-started' | 'in-progress' | 'completed'
  startTime?: string;
  completionTime?: string;
  champions?: Record<string, string>;
  innovationProject: string[];
  robotDesign: string[];
  coreValues: string[];
  optionalAwards?: Record<string, string[]>;
}

export interface JudgingData {
  divisionId: string;
  sessions: JudgingSession[];
  innovation_project?: JudgingDeliberation;
  robot_design?: JudgingDeliberation;
  core_values?: JudgingDeliberation;
  finalDeliberation?: FinalDeliberation;
  sessionLength: number;
  awards: Award[];
}

export interface CategorizedDeliberations extends Record<string, JudgingDeliberation | undefined> {
  innovation_project?: JudgingDeliberation;
  robot_design?: JudgingDeliberation;
  core_values?: JudgingDeliberation;
}

export interface JudgeAdvisorData {
  sessions: JudgingSession[];
  awards: Award[];
  deliberations: CategorizedDeliberations;
  finalDeliberation: FinalDeliberation | null;
  sessionLength: number;
}

export interface QueryData {
  division?: {
    id: string;
    awards: Award[];
    judging: JudgingData;
  } | null;
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
  awards: Award[];
  deliberations: CategorizedDeliberations;
  finalDeliberation: FinalDeliberation | null;
}
