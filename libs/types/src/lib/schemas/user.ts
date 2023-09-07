import { ObjectId } from 'mongodb';
import { Role, RoleAssociationType } from '../roles';

export interface User {
  username?: string;
  isAdmin: boolean;
  event?: ObjectId;
  role?: Role;
  roleAssociation?: { type: RoleAssociationType; value: string | ObjectId };
  password: string;
  lastPasswordSetDate: Date;
}
