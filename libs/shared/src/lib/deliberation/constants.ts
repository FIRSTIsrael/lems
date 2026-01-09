/**
 * Maximum picklist limit when using default formula.
 * Picklist cannot exceed 12 teams (Enforced only in the UI).
 */
export const MAX_PICKLIST_LIMIT = 12;

/**
 * Default multiplier for calculating picklist limit.
 * Picklist limit = min(12, ceil(teamCount * 0.35))
 */
export const PICKLIST_LIMIT_MULTIPLIER = 0.35;
