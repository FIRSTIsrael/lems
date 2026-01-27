import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export type PermissionType =
  | 'MANAGE_SEASONS'
  | 'MANAGE_USERS'
  | 'MANAGE_EVENTS'
  | 'MANAGE_EVENT_DETAILS'
  | 'MANAGE_TEAMS'
  | 'VIEW_INSIGHTS'
  | 'MANAGE_FAQ';

export interface AdminPermissionTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  admin_id: string; // UUID foreign key to admins.id
  permission: PermissionType;
  granted_at: ColumnType<Date, never, never>; // Generated on insert
}

export type AdminPermission = Selectable<AdminPermissionTable>;
export type InsertableAdminPermission = Insertable<AdminPermissionTable>;
export type UpdateableAdminPermission = Updateable<AdminPermissionTable>;
