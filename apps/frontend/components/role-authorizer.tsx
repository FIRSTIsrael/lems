import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Role, SafeUser } from '@lems/types';
import { ensureArray } from '@lems/utils';
import { apiFetch } from '../lib/utils/fetch';
import useLocalStorage from '../hooks/use-local-storage';

interface Props {
  roles: Role | Array<Role>;
  children?: React.ReactNode;
}

export const RoleAuthorizer: React.FC<Props> = ({ roles, children }) => {
  const roleArray: Array<Role> = ensureArray(roles);

  const router = useRouter();
  const [roleMatch, setRoleMatch] = useState(false);
  // TODO: user is undefined always (on refresh), but works on rebuild (ctrl+s)
  // Local storage can get rid of a nasty extra api call, so lets fix this
  const [user, setUser] = useLocalStorage<SafeUser>('user', {} as SafeUser);

  useEffect(() => {
    roleCheck();

    const hideContent = () => setRoleMatch(false);
    router.events.on('routeChangeStart', hideContent);
    router.events.on('routeChangeComplete', roleCheck);

    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', roleCheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleCheck = () => {
    apiFetch('/api/me').then(response =>
      response.json().then(user => {
        if (roleArray.includes(user.role)) {
          setRoleMatch(true);
        } else {
          setRoleMatch(false);
          router.back();
        }
      })
    );
  };

  return roleMatch && children;
};
