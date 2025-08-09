import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { PermissionType } from '@lems/database';
import { routing } from './i18n/routing';
import { getRequiredPermission } from './lib/permissions';

const publicPages = ['/login'];

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  const [, locale, ...segments] = request.nextUrl.pathname.split('/');
  const isPublicPage = publicPages.some(
    page =>
      segments.join('/') === page.slice(1) || // Remove leading slash for comparison
      (segments.length === 0 && page === '/') // Handle root path
  );

  if (isPublicPage) {
    return response;
  }

  const { pathname } = request.nextUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

  try {
    const authResponse = await fetch(`${backendUrl}/admin/auth/verify`, {
      headers: { Cookie: request.headers.get('cookie') || '' }
    });

    if (!authResponse.ok) {
      throw new Error('Admin authentication failed');
    }

    // Auth succeeded, check page permissions
    const currentPage = segments[0];
    const requiredPermission = getRequiredPermission(currentPage);

    if (requiredPermission) {
      try {
        const permissionsResponse = await fetch(`${backendUrl}/admin/users/permissions/me`, {
          headers: { Cookie: request.headers.get('cookie') || '' }
        });

        if (permissionsResponse.ok) {
          const permissions: PermissionType[] = await permissionsResponse.json();

          if (Array.isArray(permissions) && !permissions.includes(requiredPermission)) {
            const homeUrl = locale ? `/${locale}` : '/';
            return NextResponse.redirect(new URL(homeUrl, request.url));
          }
        }
      } catch {
        // This should never happen so we treat it as if the user is logged out.
        throw new Error('Permission check failed');
      }
    }

    // Add the current page to headers for the PermissionGuard component to use
    response.headers.set('x-current-page', currentPage || '');

    return response;
  } catch {
    // Authentication failed
    await fetch(`${backendUrl}/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: request.headers.get('cookie') || '' }
    });

    const loginUrl = locale ? `/${locale}/login` : '/login';
    const redirectUrl = new URL(
      `${loginUrl}?returnUrl=${encodeURIComponent(pathname)}`,
      request.url
    );

    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
