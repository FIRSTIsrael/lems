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

/**
 * MongoDB document for final deliberation.
 * Stores the state of the final deliberation process for a division.
 */
export interface FinalDeliberation {
  divisionId: string; // UUID of division from divisions table
  stage: FinalDeliberationStage; // Current deliberation stage
  status: FinalDeliberationStatus; // Overall deliberation status
  startTime: Date | null; // When deliberation was started
  completionTime: Date | null; // When deliberation was completed
  awards: FinalDeliberationAwards; // Award assignments
  stageData: FinalDeliberationStageData; // Per-stage configuration
}
