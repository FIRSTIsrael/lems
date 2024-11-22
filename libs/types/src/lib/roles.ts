import { ObjectId } from 'mongodb';

export const RoleTypes = [
  'judge-advisor',
  'lead-judge',
  'judge',
  'reports',
  'referee',
  'head-referee',
  'scorekeeper',
  'queuer',
  'head-queuer',
  'pit-admin',
  'audience-display',
  'tournament-manager',
  'mc'
] as const;
export type Role = (typeof RoleTypes)[number];

export const RoleAssociationTypes = ['room', 'table', 'category', 'section'] as const;
export type RoleAssociationType = (typeof RoleAssociationTypes)[number];

export const getAssociationType = (role: Role): RoleAssociationType | undefined => {
  switch (role) {
    case 'lead-judge':
      return 'category';
    case 'judge':
      return 'room';
    case 'referee':
      return 'table';
    case 'queuer':
      return 'section';
    case 'head-queuer':
      return 'section';
  }
  return undefined;
};

export type RoleAssociation = { type: RoleAssociationType; value: string | ObjectId };
