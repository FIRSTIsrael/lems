/**
 * Constants and utilities for final deliberations
 */

export const ADVANCEMENT_PERCENTAGE = 0.3; // 30% of teams advance

export type FinalDeliberationStage = 'champions' | 'core-awards' | 'optional-awards' | 'review';
export type FinalDeliberationStatus = 'not-started' | 'in-progress' | 'completed';

export const STAGE_LABELS: Record<FinalDeliberationStage, string> = {
  champions: 'Champions',
  'core-awards': 'Core Awards',
  'optional-awards': 'Optional Awards',
  review: 'Review'
};

export const STAGE_ORDER: FinalDeliberationStage[] = [
  'champions',
  'core-awards',
  'optional-awards',
  'review'
];
