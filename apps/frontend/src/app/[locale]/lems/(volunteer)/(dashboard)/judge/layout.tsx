'use client';

import { useUser } from '../../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  authorizeUserRole(user, 'judge');

  const roomId = user.roleInfo?.['roomId'];

  if (!roomId) {
    throw new Error('Judge user is missing roomId in roleInfo');
  }

  return <>{children}</>;
}
