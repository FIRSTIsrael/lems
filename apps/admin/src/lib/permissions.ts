import { PermissionType } from '@lems/database';

const pagePermissions: Record<string, PermissionType> = {
  seasons: 'MANAGE_SEASONS',
  users: 'MANAGE_USERS',
  events: 'MANAGE_EVENTS',
  teams: 'MANAGE_TEAMS',
  insights: 'VIEW_INSIGHTS',
  'openapi-docs': 'DEV_TOOLS',
  'graphql-schema': 'DEV_TOOLS'
};

/**
 * Check if user has permission to access a specific page
 * @param userPermissions - Array of permissions the user has
 * @param page - The page route (e.g., 'seasons', 'users', etc.)
 * @returns true if user has permission, false otherwise
 */
export function hasPagePermission(userPermissions: PermissionType[], page: string): boolean {
  const requiredPermission = pagePermissions[page];
  if (!requiredPermission) {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

/**
 * Get the required permission for a page
 * @param page - The page route
 * @returns The required permission or null if no permission is required
 */
export function getRequiredPermission(page: string): PermissionType | null {
  return pagePermissions[page] || null;
}
