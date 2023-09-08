import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SafeUser } from '@lems/types';
import { apiFetch } from '../lib/utils/fetch';
import useLocalStorage from '../hooks/use-local-storage';

interface Props {
  children?: React.ReactNode;
}

export const RouteAuthorizer: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useLocalStorage<SafeUser>('user', {} as SafeUser);

  useEffect(() => {
    authCheck(router.asPath);

    const hideContent = () => setAuthorized(false);
    router.events.on('routeChangeStart', hideContent);
    router.events.on('routeChangeComplete', authCheck);

    return () => {
      router.events.off('routeChangeStart', hideContent);
      router.events.off('routeChangeComplete', authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const authCheck = (url: string) => {
    const publicPaths = ['/login'];
    const path = url.split('?')[0];

    apiFetch('/api/me').then(response => {
      if (!response.ok && !publicPaths.includes(path)) {
        apiFetch('/auth/logout').then(response => {
          setUser({} as SafeUser);
          setAuthorized(false);
          router.push({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          });
        });
      } else {
        response.json().then(loggedInUser => {
          setUser(loggedInUser);
          setAuthorized(true);
        });
      }
    });
  };

  return authorized && children;
};
