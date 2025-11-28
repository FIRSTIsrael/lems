export type JudgingCategory = 'innovation-project' | 'robot-design' | 'core-values';

export type RubricStatus = 'empty' | 'draft' | 'completed' | 'locked' | 'approved';

export interface Rubric {
  divisionId: string;
  teamId: string;
  category: JudgingCategory;
  status: RubricStatus;
  data?: {
    awards?: Record<string, boolean>;
    vales: Record<string, { value: number; notes?: string }>;
    feedback: { greatJob: string; thinkAbout: string };
  };
}
