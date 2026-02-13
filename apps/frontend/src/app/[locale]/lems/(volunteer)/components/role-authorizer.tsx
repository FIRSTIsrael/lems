import { useEffect, useState } from 'react';
import { ensureArray, partialMatch } from '@lems/shared/utils';
import { LemsUser } from '@lems/types/api/lems';

interface RoleAuthorizerProps {
  user: LemsUser;
  allowedRoles?: string | string[];
  conditionalRoles?: string | string[];
  conditions?: Partial<LemsUser>;
  children?: React.ReactNode;
}

export const RoleAuthorizer: React.FC<RoleAuthorizerProps> = ({
  user,
  allowedRoles,
  conditionalRoles,
  conditions,
  children
}) => {
  if (!allowedRoles && !conditionalRoles) {
    throw new Error('You must specify either allowed or conditional roles');
  }
  if (conditionalRoles && !conditions) {
    throw new Error("You speficied conditional roles, but you didn't specify conditions");
  }

  const allowedRoleArray: string[] = ensureArray(allowedRoles);
  const conditionalRoleArray: string[] = ensureArray(conditionalRoles);
  const [roleMatch, setRoleMatch] = useState(false);

  useEffect(() => {
    if (allowedRoleArray.includes(user.role)) {
      setRoleMatch(true);
    } else if (
      conditions &&
      conditionalRoleArray.includes(user.role) &&
      partialMatch(conditions, user)
    ) {
      setRoleMatch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return roleMatch && children;
};
