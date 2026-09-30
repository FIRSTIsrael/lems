import type { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export type FinalDeliberationStage = 'champions' | 'core-awards' | 'optional-awards' | 'review';
export type FinalDeliberationStatus = 'not-started' | 'in-progress' | 'completed';

/**
 * Mandatory awards structure for final deliberation.
 * These awards are always present and strongly typed.
 */
export interface MandatoryAwards {
  /** Champions placement - place-indexed object (1-4) for podium */
  champions?: {
    '1'?: string;
    '2'?: string;
    '3'?: string;
    '4'?: string;
  };
  /** Robot performance award winners (ordered list of team IDs) */
  'robot-performance'?: string[];
  /** Innovation Project award winners (ordered list of team IDs) */
  'innovation-project'?: string[];
  /** Robot Design award winners (ordered list of team IDs) */
  'robot-design'?: string[];
  /** Core Values award winners (ordered list of team IDs) */
  'core-values'?: string[];
}

/**
 * Awards structure for final deliberation.
 * Combines mandatory awards with flexible optional awards.
 */
export interface FinalDeliberationAwards extends MandatoryAwards {
  /**
   * Optional awards - dynamically determined by awards with automatic_assignment=true.
   * Key is the award name, value is an ordered list of team IDs.
   * Examples: 'breakthrough', 'motivate', 'rising-all-star', 'judges-award', 'impact', 'excellence-in-engineering'
   */
  optionalAwards?: Record<string, string[]>;
}

/**
 * Per-stage data for final deliberation.
 * Stores stage-specific settings like manual team eligibility.
 */
export interface FinalDeliberationStageData {
  'core-awards'?: {
    manualEligibility?: string[];
  };
  'optional-awards'?: {
    manualEligibility?: string[];
  };
}

export interface FinalDeliberationsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  division_id: string; // UUID foreign key to divisions.id
  stage: Generated<FinalDeliberationStage>;
  status: Generated<FinalDeliberationStatus>;
  start_time: Date | null;
  completion_time: Date | null;
  awards: Generated<FinalDeliberationAwards>;
  stage_data: Generated<FinalDeliberationStageData>;
}

export type FinalDeliberation = Selectable<FinalDeliberationsTable>;
export type NewFinalDeliberation = Insertable<FinalDeliberationsTable>;
export type FinalDeliberationUpdate = Updateable<FinalDeliberationsTable>;
