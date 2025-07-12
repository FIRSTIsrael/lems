import { AdminsTable } from './tables/admins';
import { AdminPermissionTable } from './tables/admin-permissions';

export interface DatabaseSchema {
  admins: AdminsTable;
  admin_permissions: AdminPermissionTable;
}
