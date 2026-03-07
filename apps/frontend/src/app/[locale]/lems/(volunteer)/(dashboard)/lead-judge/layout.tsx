'use client';

import { useUser } from '../../components/user-context';
import { authorizeUserRole } from '../../../lib/role-authorizer';

export default function LeadJudgeLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();

  const authorized = authorizeUserRole(user, 'lead-judge');
  if (!authorized) return null;

  // Verify that the lead judge has a category assigned
  const category = user.roleInfo?.['category'];
  if (!category) {
    throw new Error('Lead judge must have a category assigned in roleInfo');
  }

  return <>{children}</>;
}
