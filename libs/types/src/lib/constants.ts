export type DivisionColor = 'red' | 'blue';

export type Status = 'not-started' | 'in-progress' | 'completed';

export const RobotGameMatchTypes = ['practice', 'ranking'] as const;
export type RobotGameMatchType = (typeof RobotGameMatchTypes)[number];

export const JudgingCategoryTypes = ['innovation-project', 'robot-design', 'core-values'] as const;
export type JudgingCategory = (typeof JudgingCategoryTypes)[number];

export const RubricStatusTypes = [
  'empty',
  'in-progress',
  'completed',
  'waiting-for-review',
  'ready'
] as const;
export type RubricStatus = (typeof RubricStatusTypes)[number];

export const JUDGING_SESSION_LENGTH = 27 * 60;
export const MATCH_LENGTH = 2.5 * 60;
