import { JudgingCategory, RubricStatus } from '@lems/database';

export type MetricPerCategory = Record<JudgingCategory | 'total' | 'core-values-no-gp', number>;

/**
 * Metrics aggregated across all teams in a room.
 * Used to compute normalization factors.
 */
export interface RoomMetrics {
  avgScores: MetricPerCategory;
  teamCount: number;
}

/**
 * Aggregated room metrics indexed by room ID.
 */
export type RoomMetricsMap = Record<string, RoomMetrics>;

/**
 * Metadata for a single rubric field in a category.
 */
export interface FieldMetadata {
  id: string;
  category: JudgingCategory;
  sectionId: string;
  fieldNumber: number;
  displayLabel: string; // e.g., 'IP-1', 'RD-5'
  coreValues: boolean;
}

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
  status: 'not-started' | 'in-progress' | 'completed';
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
