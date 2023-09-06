import { RoleAssociationType } from '../constants';

export interface User {
  username: string;
  isAdmin: boolean;
  event?: string;
  role?: string;
  association?: { type: RoleAssociationType; value: string };
  password: string;
  lastPasswordSetDate: Date;
}
