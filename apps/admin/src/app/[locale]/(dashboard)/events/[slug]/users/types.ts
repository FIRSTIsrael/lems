export const MANDATORY_ROLES = [
  'pit-admin',
  'judge',
  'lead-judge',
  'judge-advisor',
  'referee',
  'head-referee',
  'scorekeeper'
] as const;
export type MandatoryRole = (typeof MANDATORY_ROLES)[number];

export const OPTIONAL_ROLES = [
  'field-head-queuer',
  'judging-head-queuer',
  'field-queuer',
  'judging-queuer',
  'mc',
  'field-manager',
  'audience-display',
  'reports',
  'tournament-manager'
] as const;
export type OptionalRole = (typeof OPTIONAL_ROLES)[number];

export const ROLES = [...MANDATORY_ROLES, ...OPTIONAL_ROLES] as const;
export type Role = (typeof ROLES)[number];
