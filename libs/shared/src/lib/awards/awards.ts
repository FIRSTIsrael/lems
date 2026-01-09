/**
 * Award type constants and configurations.
 * Shared across admin and volunteer applications.
 */

/**
 * IDs of awards that can be nominated through Core Values rubrics.
 */
export const CORE_VALUES_AWARDS = [
  'breakthrough',
  'rising-all-star',
  'motivate',
  'judges-award',
  'impact'
] as const;
export type CoreValuesAward = (typeof CORE_VALUES_AWARDS)[number];

/**
 * IDs of awards that can be given to individuals (not teams).
 */
export const PERSONAL_AWARDS = ['lead-mentor', 'volunteer-of-the-year'] as const;
export type PersonalAward = (typeof PERSONAL_AWARDS)[number];

/**
 * IDs of awards that are automatically assigned during final deliberation.
 * These awards will be available in the optional awards stage of final deliberation.
 */
export const AUTOMATIC_ASSIGNMENT_AWARDS = [
  'excellence-in-engineering',
  'robot-performance'
] as const;
export type AutomaticAssignmentAward = (typeof AUTOMATIC_ASSIGNMENT_AWARDS)[number];

export const OPTIONAL_AWARDS = [
  'excellence-in-engineering',
  ...PERSONAL_AWARDS,
  ...CORE_VALUES_AWARDS
] as const;
export type OptionalAwards = (typeof OPTIONAL_AWARDS)[number];

export const MANDATORY_AWARDS = [
  'core-values',
  'innovation-project',
  'robot-design',
  'robot-performance',
  'champions'
] as const;
export type MandatoryAwards = (typeof MANDATORY_AWARDS)[number];

export const HIDE_PLACES: Award[] = [
  ...PERSONAL_AWARDS,
  ...CORE_VALUES_AWARDS,
  'excellence-in-engineering'
];

export const AWARDS = [...MANDATORY_AWARDS, ...OPTIONAL_AWARDS, 'advancement'] as const;
export type Award = (typeof AWARDS)[number];

/**
 * Schema defining the maximum number of each award to be given out at an event.
 */
export const AWARD_LIMITS: { [key in Award]: number } = {
  champions: 4,
  'robot-design': 4,
  'innovation-project': 4,
  'core-values': 4,
  'robot-performance': 4,
  breakthrough: 3,
  'excellence-in-engineering': 3,
  motivate: 3,
  'rising-all-star': 3,
  'judges-award': 3,
  impact: 1,
  'lead-mentor': -1, // Unlimited
  'volunteer-of-the-year': -1, // Unlimited
  advancement: -1 // Unlimited
};
