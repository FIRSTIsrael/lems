// Roles that are managed by the system and cannot be edited manually (always required)
export const SYSTEM_MANAGED_ROLES = ['referee', 'judge'] as const;
export type SystemManagedRole = (typeof SYSTEM_MANAGED_ROLES)[number];

// System-managed roles that can be toggled on/off
export const TOGGLEABLE_SYSTEM_ROLES = ['lead-judge'] as const;
export type ToggleableSystemRole = (typeof TOGGLEABLE_SYSTEM_ROLES)[number];

// All system roles (mandatory + toggleable)
export const ALL_SYSTEM_ROLES = [...SYSTEM_MANAGED_ROLES, ...TOGGLEABLE_SYSTEM_ROLES] as const;
export type AllSystemRole = (typeof ALL_SYSTEM_ROLES)[number];

// Mandatory roles that can be edited manually
export const EDITABLE_MANDATORY_ROLES = [
  'pit-admin',
  'judge-advisor',
  'head-referee',
  'scorekeeper'
] as const;
export type EditableMandatoryRole = (typeof EDITABLE_MANDATORY_ROLES)[number];

// All mandatory roles (system-managed + editable)
export const MANDATORY_ROLES = [...SYSTEM_MANAGED_ROLES, ...EDITABLE_MANDATORY_ROLES] as const;
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

export const ROLES = [...MANDATORY_ROLES, ...TOGGLEABLE_SYSTEM_ROLES, ...OPTIONAL_ROLES] as const;
export type Role = (typeof ROLES)[number];
