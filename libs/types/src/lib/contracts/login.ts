import { RoleAssociationType } from '../constants';

export interface LoginRequest {
  event?: string;
  username: string;
  isAdmin: boolean;
  role?: string;
  association?: { type: RoleAssociationType; value: string };
  password: string;
}
