import { PERSONAL_AWARDS } from '@lems/types/fll';
import { AwardSchema } from '../types';

export interface ValidationResult {
  minimumAwards: number;
  maximumAwards: number;
  minimumPercentage: number;
  maximumPercentage: number;
  isValid: boolean;
  reasons: string[];
}

/**
 * Validates the awards schema based on the number of teams at the event.
 *
 * Rules:
 * - Minimum calculation: All non-personal awards except 'advancement' and 'robot-performance'
 * - Maximum calculation: Minimum + robot-performance awards
 * - Valid if minimum >= 30% and maximum <= 50% of team count
 *
 * @param schema - The award schema containing counts for each award
 * @param teamCount - The number of teams at the event
 * @returns Validation result with percentages and validity status
 */
export function validateAwardsSchema(schema: AwardSchema, teamCount: number): ValidationResult {
  const reasons: string[] = [];

  // Calculate minimum awards (exclude personal awards, advancement, and robot-performance)
  const minimumAwards = Object.entries(schema).reduce((total, [award, item]) => {
    const isPersonalAward = (PERSONAL_AWARDS as readonly string[]).includes(award);
    const isAdvancement = award === 'advancement';
    const isRobotPerformance = award === 'robot-performance';

    if (!isPersonalAward && !isAdvancement && !isRobotPerformance && item.count > 0) {
      return total + item.count;
    }
    return total;
  }, 0);

  // Calculate maximum awards (minimum + robot-performance)
  const robotPerformanceCount = schema['robot-performance']?.count || 0;
  const maximumAwards = minimumAwards + robotPerformanceCount;

  // Calculate percentages with 2 decimal precision
  const minimumPercentage = Math.round((minimumAwards / teamCount) * 10000) / 100;
  const maximumPercentage = Math.round((maximumAwards / teamCount) * 10000) / 100;

  const minimumValid = minimumPercentage >= 30;
  const maximumValid = maximumPercentage <= 50;
  const isValid = minimumValid && maximumValid;

  if (!minimumValid) {
    reasons.push(`Minimum awards (${minimumPercentage}%) must be at least 30% of teams`);
  }
  if (!maximumValid) {
    reasons.push(`Maximum awards (${maximumPercentage}%) must not exceed 50% of teams`);
  }

  return {
    minimumAwards,
    maximumAwards,
    minimumPercentage,
    maximumPercentage,
    isValid,
    reasons
  };
}
