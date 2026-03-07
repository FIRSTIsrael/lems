'use client';

import { useUser } from '../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function JudgeAdvisorLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, 'judge-advisor');
  if (!authorized) return null;

  return <>{children}</>;
}
