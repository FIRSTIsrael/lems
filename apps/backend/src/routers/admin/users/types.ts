import { z } from 'zod';
import { Admin, PermissionType } from '@lems/database';

export const AdminUserResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.date()
});

export type AdminUserResponse = z.infer<typeof AdminUserResponseSchema>;

// Create a const assertion array from PermissionType for Zod
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

/**
 * Transforms a user object into a response format.
 * Removes sensitive information and formats the response.
 * @param {Admin} user - The user object to transform.
 */
export const makeAdminUserResponse = (user: Admin): AdminUserResponse => ({
  id: user.id,
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  createdAt: user.created_at
});
