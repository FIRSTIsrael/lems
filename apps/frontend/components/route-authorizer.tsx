import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/utils/fetch';

interface RouteAuthorizerProps {
  children?: React.ReactNode;
}

export const RouteAuthorizer: React.FC<RouteAuthorizerProps> = ({ children }) => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

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
    const adminPaths = ['/admin'];
    const path = url.split('?')[0];

    apiFetch('/api/me').then(response => {
      if (!response.ok && !publicPaths.includes(path)) {
        apiFetch('/auth/logout', { method: 'POST' }).then(response => {
          setAuthorized(false);
          router.push({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          });
        });
      } else {
        if (adminPaths.includes(path)) {
          response
            .json()
            .then(user => user.isAdmin)
            .then(admin => {
              if (!admin) {
                setAuthorized(false);
                router.push({
                  pathname: '/login'
                });
              } else {
                setAuthorized(true);
              }
            });
        } else {
          setAuthorized(true);
        }
      }
    });
  };

  return authorized && children;
};
