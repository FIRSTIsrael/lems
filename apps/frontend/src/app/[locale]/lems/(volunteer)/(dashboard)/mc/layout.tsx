'use client';

import { useUser } from '../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function McLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, 'mc');
  if (!authorized) return null;

  return <>{children}</>;
}
