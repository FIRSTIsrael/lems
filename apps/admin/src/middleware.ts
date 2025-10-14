import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { PermissionType } from '@lems/database';
import { routing } from './i18n/routing';
import { getRequiredPermission } from './lib/permissions';

const publicPages = ['/login'];

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  const { nextUrl } = request;
  const { basePath } = nextUrl;

  // Trim basePath for routing logic
  let pathname = request.nextUrl.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length);
  }

  // Ensure we always have a leading slash
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  const segments = pathname.split('/').filter(Boolean);
  const isPublicPage = publicPages.some(
    page => pathname === page || pathname.startsWith(page + '/')
  );

  if (isPublicPage) {
    return response;
  }

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
            // Redirect to home page
            const homeUrl = basePath || '/';
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
    // Authentication failed - logout and clear cookies
    await fetch(`${backendUrl}/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: request.headers.get('cookie') || '' }
    });

    const loginUrl = basePath + '/login';

    const isAlreadyOnLogin = pathname.endsWith('/login');
    const redirectUrl = isAlreadyOnLogin
      ? new URL(loginUrl, request.url)
      : new URL(
          `${loginUrl}?returnUrl=${encodeURIComponent(request.nextUrl.pathname)}`,
          request.url
        );

    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Clear the cookie on the client side to prevent redirect loops
    redirectResponse.cookies.set('admin-auth-token', '', {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return redirectResponse;
  }
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/', '/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
