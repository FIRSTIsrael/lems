import { z } from 'zod';
import { PermissionType } from '@lems/database';

export const AdminUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.coerce.date()
});

export type AdminUser = z.infer<typeof AdminUserResponseSchema>;

export const AdminUsersResponseSchema = z.array(AdminUserResponseSchema);

const PERMISSION_VALUES = [
  'MANAGE_SEASONS',
  'MANAGE_USERS',
  'MANAGE_EVENTS',
  'MANAGE_EVENT_DETAILS',
  'MANAGE_TEAMS',
  'VIEW_INSIGHTS'
] as const satisfies readonly PermissionType[];

export const AdminUserPermissionsResponseSchema = z.array(z.enum(PERMISSION_VALUES));

export type AdminUserPermissions = z.infer<typeof AdminUserPermissionsResponseSchema>;
