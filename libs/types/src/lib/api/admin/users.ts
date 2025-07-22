import { z } from 'zod';
import { PermissionType } from '@lems/database';

export const AdminUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.date()
});

export type AdminUserResponse = z.infer<typeof AdminUserResponseSchema>;

const PERMISSION_VALUES = [
  'MANAGE_SEASONS',
  'MANAGE_USERS',
  'MANAGE_EVENTS',
  'MANAGE_EVENT_DETAILS',
  'MANAGE_TEAMS',
  'VIEW_INSIGHTS'
] as const satisfies readonly PermissionType[];

export const AdminUserPermissionsResponseSchema = z.array(z.enum(PERMISSION_VALUES));

export type AdminUserPermissionsResponse = z.infer<typeof AdminUserPermissionsResponseSchema>;
