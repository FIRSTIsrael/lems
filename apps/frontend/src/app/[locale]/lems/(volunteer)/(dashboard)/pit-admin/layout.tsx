'use client';

import { useUser } from '../../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function PitAdminLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  authorizeUserRole(user, 'pit-admin');

  return <>{children}</>;
}
