'use client';

import { useUser } from '../../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  authorizeUserRole(user, 'judge');

  return <>{children}</>;
}
