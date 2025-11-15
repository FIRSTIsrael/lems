import { redirect } from 'next/navigation';
import { LemsUser } from '@lems/types/api/lems';

export type AllowedRoles = string | string[];

/**
 * Server-side utility to check if a user has the required role(s).
 * If the user doesn't have access, they are redirected to the parent LEMS page.
 *
 * Use this in async layout or page components to protect routes:
 *
 * @example
 * export default async function TournamentManagerLayout({ children }: { children: React.ReactNode }) {
 *   const user = useUser(); // This will throw if not in UserProvider
 *   authorizeUserRole(user, 'tournament-manager');
 *   return <div>{children}</div>;
 * }
 *
 * @param user - The authenticated user object
 * @param allowedRoles - Single role or array of allowed roles
 * @param redirectTo - Optional custom redirect URL (defaults to /lems)
 * @throws Redirect if user doesn't have required role
 */
export function authorizeUserRole(
  user: LemsUser,
  allowedRoles: AllowedRoles,
  redirectTo: string = '/lems'
): void {
  const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!rolesArray.includes(user.role)) {
    redirect(redirectTo);
  }
}
