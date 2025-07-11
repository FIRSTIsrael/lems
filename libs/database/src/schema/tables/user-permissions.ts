import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export type PermissionType =
  | 'MANAGE_USERS'
  | 'MANAGE_EVENTS'
  | 'MANAGE_EVENT_DETAILS'
  | 'MANAGE_TEAMS'
  | 'VIEW_INSIGHTS';

export interface UserPermissionTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  user_id: string; // UUID foreign key to users.id
  permission: PermissionType;
  granted_at: ColumnType<Date, never, never>; // Generated on insert
}

export type UserPermission = Selectable<UserPermissionTable>;
export type InsertableUserPermission = Insertable<UserPermissionTable>;
export type UpdateableUserPermission = Updateable<UserPermissionTable>;
