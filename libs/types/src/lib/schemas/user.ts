import { ObjectId } from 'mongodb';

export type Role =
  | 'judge-advisor'
  | 'lead-judge'
  | 'judge'
  | 'display'
  | 'referee'
  | 'head-referee'
  | 'scorekeeper'
  | 'pit-admin'
  | 'audience'
  | 'tournament-manager';

export type RoleAssociationType = 'room' | 'table' | 'category';

export interface User {
  username?: string;
  isAdmin: boolean;
  event?: ObjectId;
  role?: Role;
  roleAssociation?: { type: RoleAssociationType; value: string | ObjectId };
  password: string;
  lastPasswordSetDate: Date;
}
