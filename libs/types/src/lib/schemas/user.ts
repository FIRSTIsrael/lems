import { ObjectId } from 'mongodb';
import { Role, RoleAssociation } from '../roles';

export interface User {
  username?: string;
  isAdmin: boolean;
  eventId?: ObjectId;
  divisionId?: ObjectId;
  role?: Role;
  roleAssociation?: RoleAssociation;
  password: string;
  lastPasswordSetDate: Date;
}

export type SafeUser = Omit<User, 'password' | 'lastPasswordSetDate'>;
