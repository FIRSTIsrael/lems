'use client';

import { useUser } from '../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function PracticeTablesManagerLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, 'practice-tables-manager');
  if (!authorized) return null;

  return <>{children}</>;
}
