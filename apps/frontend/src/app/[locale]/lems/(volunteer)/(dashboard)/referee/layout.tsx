'use client';

import { useUser } from '../../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function RefereeLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, 'referee');
  if (!authorized) return null;

  return <>{children}</>;
}
