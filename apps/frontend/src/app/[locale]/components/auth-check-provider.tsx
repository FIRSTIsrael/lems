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
  const locale = useLocale();

  // Determine if current page is public
  const localeRegex = new RegExp(`^/${locale}`);
  const publicPages = ['/', '/events'];
  const cleanPath = pathname.replace(localeRegex, '/');
  const isPublicPage =
    publicPages.includes(cleanPath) ||
    cleanPath.startsWith('/event/') ||
    cleanPath.endsWith('/login');

  const [loading, setLoading] = useState(!isPublicPage);

  useEffect(() => {
    // Skip auth check on public pages and login pages
    if (isPublicPage) {
      return;
    }

    const checkAuth = async () => {
      try {
        // Check if user is authenticated
        const authResult = await apiFetch('/lems/auth/verify');

        if (authResult.ok) {
          // Authenticated user - allow access
          setLoading(false);
        } else {
          // Not authenticated on protected page - redirect to homepage
          router.push('/');
        }
      } catch {
        // On error, redirect to homepage
        router.push('/');
      }
    };

    checkAuth();
  }, [isPublicPage, router]);

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
