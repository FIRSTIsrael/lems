'use client';

import { useUser } from '../components/user-context';
import { authorizeUserRole } from '../../lib/role-authorizer';

export default function ScorekeeperLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, ['lead-judge', 'judge-advisor']);
  if (!authorized) return null;

  return <>{children}</>;
}
