import { JudgingCategory as _JudgingCategory } from '@lems/database';

/**
 * FIRST LEGO League Judging Categories
 */
export type JudgingCategory = _JudgingCategory;

/**
 * Ordered list of all Judging Categories
 */
export const JUDGING_CATEGORIES: JudgingCategory[] = [
  'innovation-project',
  'robot-design',
  'core-values'
];
