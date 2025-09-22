import { PERSONAL_AWARDS } from '@lems/types/fll';
import { AwardSchema } from '../types';

export interface ValidationResult {
  minimumAwards: number;
  maximumAwards: number;
  minimumPercentage: number;
  maximumPercentage: number;
  isValid: boolean;
  reasons: { key: string; count?: number }[];
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
  const reasons: { key: string; count?: number }[] = [];

  /** Minimum awards given out. This excludes personal awards, advancement, and robot-performance */
  const minimumAwards = Object.entries(schema).reduce((total, [award, item]) => {
    const isPersonalAward = (PERSONAL_AWARDS as readonly string[]).includes(award);
    const isAdvancement = award === 'advancement';
    const isRobotPerformance = award === 'robot-performance';

    if (!isPersonalAward && !isAdvancement && !isRobotPerformance && item.count > 0) {
      return total + item.count;
    }
    return total;
  }, 0);

  /** Maximum awards to be given out. This assumes all robot-performance awards
   * are given out to teams that did not win any other awards. */
  const robotPerformanceCount = schema['robot-performance']?.count || 0;
  const maximumAwards = minimumAwards + robotPerformanceCount;

  const minimumPercentage = Math.round((minimumAwards / teamCount) * 10000) / 100;
  const maximumPercentage = Math.round((maximumAwards / teamCount) * 10000) / 100;

  const minimumValid = minimumPercentage >= 30;
  const maximumValid = maximumPercentage <= 50;
  const isValid = minimumValid && maximumValid;

  if (teamCount === 0) {
    reasons.push({ key: 'errors.no-teams' });
  }
  if (!minimumValid) {
    reasons.push({ key: 'errors.not-enough-awards', count: minimumPercentage });
  }
  if (!maximumValid) {
    reasons.push({ key: 'errors.too-many-awards', count: maximumPercentage });
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
