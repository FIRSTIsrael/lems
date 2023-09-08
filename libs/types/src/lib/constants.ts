export type DivisionColor = 'red' | 'blue';

export const JudgingCategoryTypes = ['innovation-project', 'robot-design', 'core-values'] as const;

export type JudgingCategory = (typeof JudgingCategoryTypes)[number];
