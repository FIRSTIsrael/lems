export type JudgingCategory = 'innovation-project' | 'robot-design' | 'core-values';

export type RubricStatus = 'empty' | 'draft' | 'completed' | 'locked' | 'approved';

export interface Rubric {
  _id?: string; // MongoDB ObjectId
  divisionId: string;
  teamId: string;
  category: JudgingCategory;
  status: RubricStatus;
  data?: {
    /**
     * Optional award nominations.
     * Should only be present on core-values rubrics.
     */
    awards?: Record<string, boolean>;

    /**
     * Contains scores and notes for each section and field in the rubric.
     * These are keyed by field IDs, and not split up per sections.
     *
     * @example
     * '{problem: {value: 3}}' - where problem is the first field of the
     * 'identify' section in the 'innovation-project' rubric.
     */
    fields: Record<string, { value: 1 | 2 | 3 | 4 | null; notes?: string }>;

    /**
     * Free text feedback provided by judges.
     */
    feedback?: { greatJob: string; thinkAbout: string };
  };
}
