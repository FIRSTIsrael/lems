import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Role, SafeUser } from '@lems/types';
import { ensureArray } from '@lems/utils';
import useLocalStorage from '../hooks/use-local-storage';

interface Props {
  roles: Role | Array<Role>;
  children?: React.ReactNode;
}

export const RoleAuthorizer: React.FC<Props> = ({ roles, children }) => {
  const roleArray: Array<Role> = ensureArray(roles);

  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useLocalStorage<SafeUser>('user', {} as SafeUser);

  useEffect(() => {
    roleCheck();

    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);
    router.events.on('routeChangeComplete', roleCheck);

    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', roleCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const roleCheck = () => {
    if (user && user.role && user.role in roleArray) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      router.back();
    }
  };

  return authorized && children;
};
