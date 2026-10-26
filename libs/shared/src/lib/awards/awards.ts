import type { Edition } from '../edition';

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
  'impact',
  'inspiration'
] as const;
export type CoreValuesAward = (typeof CORE_VALUES_AWARDS)[number];

/**
 * IDs of awards that can be given to individuals (not teams).
 */
export const PERSONAL_AWARDS = ['lead-mentor', 'volunteer-of-the-year'] as const;
export type PersonalAward = (typeof PERSONAL_AWARDS)[number];

/**
 * IDs of awards that are assigned by the system during final deliberation,
 * rather than picked by judges in the optional-awards stage.
 */
export const AUTOMATIC_ASSIGNMENT_AWARDS = [
  'excellence-in-engineering',
  'robot-performance',
  'coopertition'
] as const;
export type AutomaticAssignmentAward = (typeof AUTOMATIC_ASSIGNMENT_AWARDS)[number];

export const OPTIONAL_AWARDS = [
  'excellence-in-engineering',
  ...PERSONAL_AWARDS,
  ...CORE_VALUES_AWARDS,
  'peer',
  'coopertition'
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
  'excellence-in-engineering',
  'peer'
];

export const AWARDS = [...MANDATORY_AWARDS, ...OPTIONAL_AWARDS, 'advancement'] as const;
export type Award = (typeof AWARDS)[number];

/**
 * Team awards judges assign during the optional-awards deliberation stage.
 * Personal awards are optional but assigned outside deliberation.
 * Automatically assigned awards, such as excellence in engineering, are filled in earlier.
 */
export function isDeliberationOptionalAward(award: {
  type: string;
  isOptional: boolean;
  automaticAssignment: boolean;
}): boolean {
  return award.type === 'TEAM' && award.isOptional && !award.automaticAssignment;
}

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
  inspiration: 1,
  peer: 1,
  coopertition: 4,
  'lead-mentor': -1, // Unlimited
  'volunteer-of-the-year': -1, // Unlimited
  advancement: -1 // Unlimited
};

/** Awards whose display name or description differs in Future Edition. Ids are unchanged. */
const FUTURE_LABEL_OVERRIDES: readonly string[] = [
  'champions',
  'core-values',
  'innovation-project',
  'robot-design',
  'robot-performance',
  'rising-all-star',
  'lead-mentor'
];

/** Returns the translation key id for an award under the given edition. */
export const getAwardLabelKey = (award: string, edition: Edition): string =>
  edition === 'future' && FUTURE_LABEL_OVERRIDES.includes(award) ? `future.${award}` : award;

/** Awards offered only to Future Edition divisions. Every other award is available in both editions. */
export const FUTURE_ONLY_AWARDS = [
  'inspiration',
  'peer',
  'coopertition'
] as const satisfies readonly Award[];

/** Awards whose winners stay eligible for other awards. */
export const STACKABLE_AWARDS = [
  'robot-performance',
  'coopertition'
] as const satisfies readonly Award[];

/** Awards where each place is shared by two teams (two award rows per place). */
export const CO_WINNER_AWARDS = ['coopertition'] as const satisfies readonly Award[];

export const getAwardRowsPerPlace = (award: string): 1 | 2 =>
  (CO_WINNER_AWARDS as readonly string[]).includes(award) ? 2 : 1;

const isInEdition = (award: string, edition: Edition): boolean =>
  edition === 'future' || !(FUTURE_ONLY_AWARDS as readonly string[]).includes(award);

export const getAvailableAwards = (edition: Edition): readonly Award[] =>
  AWARDS.filter(award => isInEdition(award, edition));

export const getOptionalAwards = (edition: Edition): readonly OptionalAwards[] =>
  OPTIONAL_AWARDS.filter(award => isInEdition(award, edition));

export const getCoreValuesAwards = (edition: Edition): readonly CoreValuesAward[] =>
  CORE_VALUES_AWARDS.filter(award => isInEdition(award, edition));

export const isAwardAvailable = (award: string, edition: Edition): boolean =>
  (AWARDS as readonly string[]).includes(award) && isInEdition(award, edition);
