'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiFetch } from '@lems/shared';
import { Box, CircularProgress } from '@mui/material';
import { useLocale } from 'next-intl';

interface AuthCheckProviderProps {
  children: React.ReactNode;
}

/**
 * Redirects authenticated users from public pages (homepage, events, login) to /lems
 */
export function AuthCheckProvider({ children }: AuthCheckProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const locale = useLocale();

  useEffect(() => {
    const localeRegex = new RegExp(`^/${locale}`);

    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authResult = await apiFetch('/lems/auth/verify');

        if (authResult.ok) {
          // Authenticated user on public page - redirect to /lems
          const publicPages = ['/', '/events'];
          const cleanPath = pathname.replace(localeRegex, '/');

          if (publicPages.includes(cleanPath) || cleanPath.startsWith('/lems/')) {
            // On event page or login page - allow access
            setLoading(false);
            return;
          }

          // Redirect to /lems dashboard
          router.push(`/lems`);
        } else {
          // Not authenticated - allow access to public pages
          setLoading(false);
        }
      } catch {
        // On error, allow access
        setLoading(false);
      }
    };

    checkAuth();
  }, [locale, pathname, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
