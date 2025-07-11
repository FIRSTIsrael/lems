import { UserTable } from './tables/users';
import { UserPermissionTable } from './tables/user-permissions';

export interface DatabaseSchema {
  users: UserTable;
  user_permissions: UserPermissionTable;
}
