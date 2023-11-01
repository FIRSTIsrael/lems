import { ObjectId } from 'mongodb';

export const RoleTypes = [
  'judge-advisor',
  'lead-judge',
  'judge',
  'reports',
  'referee',
  'head-referee',
  'scorekeeper',
  'pit-admin',
  'audience-display',
  'tournament-manager',
  'mc'
] as const;
export type Role = (typeof RoleTypes)[number];

export const RoleAssociationTypes = ['room', 'table', 'category'] as const;
export type RoleAssociationType = (typeof RoleAssociationTypes)[number];

export const getAssociationType = (role: Role): RoleAssociationType | undefined => {
  switch (role) {
    case 'lead-judge':
      return 'category';
    case 'judge':
      return 'room';
    case 'referee':
      return 'table';
  }
  return undefined;
};

export type RoleAssociation = { type: RoleAssociationType; value: string | ObjectId };
