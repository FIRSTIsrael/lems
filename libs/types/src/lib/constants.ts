export type DivisionColor = 'red' | 'blue';

export const RobotGameMatchTypes = ['practice', 'ranking'] as const;

export type RobotGameMatchType = (typeof RobotGameMatchTypes)[number];

export const JudgingCategoryTypes = ['innovation-project', 'robot-design', 'core-values'] as const;

export type JudgingCategory = (typeof JudgingCategoryTypes)[number];
