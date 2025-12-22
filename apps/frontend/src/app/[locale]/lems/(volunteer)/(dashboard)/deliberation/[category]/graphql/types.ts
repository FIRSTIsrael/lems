import type { RubricStatus } from '@lems/database';
import type { JudgingCategory } from '@lems/types/judging';

export interface RubricFieldValue {
  value: 1 | 2 | 3 | 4 | null;
  notes?: string;
}

export interface RubricFeedback {
  greatJob: string;
  thinkAbout: string;
}

export interface RubricData {
  fields: Record<string, RubricFieldValue>;
  feedback?: RubricFeedback;
  awards?: Record<string, boolean>;
}

export interface Rubric {
  id: string;
  status: RubricStatus;
  data?: RubricData;
}

export interface CategorizedRubrics {
  innovation_project: Rubric | null;
  robot_design: Rubric | null;
  core_values: Rubric | null;
}

export interface Room {
  id: string;
  name: string;
}

export interface JudgingSession {
  id: string;
  room: Room;
}

export interface GPValue {
  value: 2 | 3 | 4 | null;
  notes?: string;
}

export interface ScoresheetData {
  score: number;
  gp?: GPValue;
}

export interface Scoresheet {
  id: string;
  round: number;
  slug: string;
  data?: ScoresheetData;
}

export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
  disqualified: boolean;
  slug: string;
  judgingSession?: JudgingSession;
  scoresheets: Scoresheet[];
  rubrics: CategorizedRubrics;
}

export type DeliberationStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface JudgingDeliberation {
  id: string;
  category: JudgingCategory;
  status: DeliberationStatus;
  startTime?: string;
  picklist: string[];
}

export interface Division {
  id: string;
  name: string;
  color: string;
  teams: Team[];
  judging: {
    deliberation: JudgingDeliberation | null;
  };
}

export interface CategoryDeliberationData {
  division: Division;
}

export interface CategoryDeliberationVars {
  divisionId: string;
  category: JudgingCategory;
}
