import React, { useState, useEffect } from 'react';
import { Role, SafeUser } from '@lems/types';
import { ensureArray } from '@lems/utils/arrays';
import { partialMatch } from '@lems/utils/objects';

interface RoleAuthorizerProps {
  user: SafeUser;
  allowedRoles?: Role | Array<Role>;
  conditionalRoles?: Role | Array<Role>;
  conditions?: Partial<SafeUser>;
  onFail?: () => void;
  children?: React.ReactNode;
}

export const RoleAuthorizer: React.FC<RoleAuthorizerProps> = ({
  user,
  allowedRoles,
  conditionalRoles,
  conditions,
  onFail,
  children
}) => {
  if (!allowedRoles && !conditionalRoles) {
    throw new Error('You must specify either allowed or conditional rows');
  }
  if (conditionalRoles && !conditions) {
    throw new Error("You speficied conditional roles, but you didn't specify conditions");
  }

  const allowedRoleArray: Array<Role> = ensureArray(allowedRoles);
  const conditionalRoleArray: Array<Role> = ensureArray(conditionalRoles);
  const [roleMatch, setRoleMatch] = useState(false);

  useEffect(() => {
    if ((user.role && allowedRoleArray.includes(user.role)) || user.isAdmin) {
      setRoleMatch(true);
    } else if (user.role && conditions && conditionalRoleArray.includes(user.role)) {
      if (partialMatch(conditions, user)) {
        setRoleMatch(true);
      } else {
        if (onFail != undefined) onFail();
      }
    } else {
      if (onFail != undefined) onFail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return roleMatch && children;
};
