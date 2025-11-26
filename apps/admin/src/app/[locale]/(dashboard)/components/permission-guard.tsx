import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PermissionType } from '@lems/database';
import { getRequiredPermission } from '../../../../lib/permissions';

interface PermissionGuardProps {
  permissions: PermissionType[];
  children: React.ReactNode;
}

export async function PermissionGuard({ permissions, children }: PermissionGuardProps) {
  const headersList = await headers();
  const currentPage = headersList.get('x-current-page') || '';

  const requiredPermission = getRequiredPermission(currentPage);

  if (!requiredPermission) {
    return <>{children}</>;
  }

  if (!permissions.includes(requiredPermission)) {
    redirect('/');
  }

  return <>{children}</>;
}
