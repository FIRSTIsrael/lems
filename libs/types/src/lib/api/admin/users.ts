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

export const ALL_ADMIN_PERMISSIONS = [
  'MANAGE_SEASONS',
  'MANAGE_USERS',
  'MANAGE_EVENTS',
  'MANAGE_EVENT_DETAILS',
  'MANAGE_TEAMS',
  'VIEW_INSIGHTS',
  'MANAGE_FAQ'
] as const satisfies readonly PermissionType[];

export const AdminUserPermissionsResponseSchema = z.array(z.enum(ALL_ADMIN_PERMISSIONS));

export type AdminUserPermissions = z.infer<typeof AdminUserPermissionsResponseSchema>;

export const VolunteerUserResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  role: z.string(),
  identifier: z.string().nullable(),
  roleInfo: z.record(z.string(), z.unknown()).nullable(),
  divisions: z.array(z.string())
});

export type VolunteerUser = z.infer<typeof VolunteerUserResponseSchema>;

export const VolunteerUsersResponseSchema = z.array(VolunteerUserResponseSchema);

export type VolunteerUsers = z.infer<typeof VolunteerUsersResponseSchema>;
