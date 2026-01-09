import { GraphQLError } from 'graphql';
import type { VolunteerUser } from '../auth-context';

/**
 * Checks if a user is authenticated
 * @throws GraphQLError if user is not authenticated
 */
export function requireAuth(user?: VolunteerUser): asserts user is VolunteerUser {
  if (!user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
}

/**
 * Checks if a user has access to a specific division
 * @throws GraphQLError if user doesn't have access to the division
 */
export function requireDivisionAccess(user: VolunteerUser, divisionId: string): void {
  if (!user.divisions.includes(divisionId)) {
    throw new GraphQLError('Access denied: user not assigned to this division', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
}

/**
 * Checks if a user is authenticated and has access to a specific division
 * @throws GraphQLError if user is not authenticated or doesn't have access
 */
export function requireAuthAndDivisionAccess(
  user: VolunteerUser | undefined,
  divisionId: string
): asserts user is VolunteerUser {
  requireAuth(user);
  requireDivisionAccess(user, divisionId);
}

/**
 * Checks if a user has one of the required roles
 * @throws GraphQLError if user doesn't have any of the required roles
 */
export function requireRole(user: VolunteerUser, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new GraphQLError(
      `Access denied: requires one of these roles: ${allowedRoles.join(', ')}`,
      {
        extensions: { code: 'FORBIDDEN' }
      }
    );
  }
}

/**
 * Checks if a user is authenticated, has access to a division, and has one of the required roles
 * @throws GraphQLError if any check fails
 */
export function requireAuthDivisionAndRole(
  user: VolunteerUser | undefined,
  divisionId: string,
  allowedRoles: string[]
): asserts user is VolunteerUser {
  requireAuth(user);
  requireDivisionAccess(user, divisionId);
  requireRole(user, allowedRoles);
}
