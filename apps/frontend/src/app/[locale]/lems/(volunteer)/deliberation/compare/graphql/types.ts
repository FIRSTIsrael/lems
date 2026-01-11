import type { RubricStatus } from '@lems/database';

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
  category: string;
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
  logoUrl?: string;
  judgingSession?: JudgingSession;
  scoresheets: Scoresheet[];
  rubrics: CategorizedRubrics;
}

export interface Award {
  id: string;
  name: string;
  place?: number;
}

export interface DivisionTeam {
  id: string;
  number: string;
  name: string;
  slug: string;
}

export interface UnifiedDivisionData {
  division: {
    id: string;
    selectedTeams: Team[];
    allTeams: DivisionTeam[];
    awards: Award[];
  };
}

export interface UnifiedDivisionVars {
  divisionId: string;
  teamSlugs?: string[] | null;
}
