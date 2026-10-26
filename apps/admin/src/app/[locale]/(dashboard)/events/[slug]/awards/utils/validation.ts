import type { Edition } from '@lems/shared/edition';
import { AwardSchema, PERSONAL_AWARDS, isAwardAvailable } from '../types';

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
 * - Minimum calculation: All non-personal awards except 'advancement', 'robot-performance' and 'coopertition'
 * - Maximum calculation: Minimum + robot-performance awards
 * - Valid if minimum >= 30% and maximum <= 50% of team count
 * - Invalid if any configured award is not available in the division's edition
 *
 * @param schema - The award schema containing counts for each award
 * @param teamCount - The number of teams at the event
 * @param edition - The division's edition
 * @returns Validation result with percentages and validity status
 */
export function validateAwardsSchema(
  schema: AwardSchema,
  teamCount: number,
  edition: Edition
): ValidationResult {
  const reasons: { key: string; count?: number }[] = [];

  /** Minimum awards given out. This excludes personal awards, advancement, and robot-performance */
  const minimumAwards = Object.entries(schema).reduce((total, [award, item]) => {
    const isPersonalAward = (PERSONAL_AWARDS as readonly string[]).includes(award);
    const isAdvancement = award === 'advancement';
    const isRobotPerformance = award === 'robot-performance';
    const isCoopertition = award === 'coopertition';

    if (
      !isPersonalAward &&
      !isAdvancement &&
      !isRobotPerformance &&
      !isCoopertition &&
      item.count > 0
    ) {
      return total + item.count;
    }
    return total;
  }, 0);

  /** Maximum awards to be given out. This assumes all robot-performance awards
   * are given out to teams that did not win any other awards. */
  const robotPerformanceCount = schema['robot-performance']?.count || 0;
  const maximumAwards = minimumAwards + robotPerformanceCount;

  const unavailableAwards = Object.entries(schema).filter(
    ([award, item]) => item.count > 0 && !isAwardAvailable(award, edition)
  );

  const minimumPercentage = Math.round((minimumAwards / teamCount) * 10000) / 100;
  const maximumPercentage = Math.round((maximumAwards / teamCount) * 10000) / 100;

  const minimumValid = minimumPercentage >= 30;
  const maximumValid = maximumPercentage <= 50;
  const isValid = minimumValid && maximumValid && unavailableAwards.length === 0;

  if (teamCount === 0) {
    reasons.push({ key: 'errors.no-teams' });
  }
  if (!minimumValid) {
    reasons.push({ key: 'errors.not-enough-awards', count: minimumPercentage });
  }
  if (!maximumValid) {
    reasons.push({ key: 'errors.too-many-awards', count: maximumPercentage });
  }
  if (unavailableAwards.length > 0) {
    reasons.push({ key: 'errors.unavailable-awards', count: unavailableAwards.length });
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
