import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
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

  // Check if this is a LEMS route (starts with /lems)
  const isLemsRoute = segments[0] === 'lems';
  const isExportsRoute = segments[1] === 'export';

  if (isLemsRoute && !isExportsRoute) {
    const backendUrl = process.env.LOCAL_BASE_URL || 'http://localhost:3333';

    try {
      const authResponse = await fetch(`${backendUrl}/lems/auth/verify`, {
        headers: { Cookie: request.headers.get('cookie') || '' }
      });

      if (!authResponse.ok) {
        throw new Error('LEMS authentication failed');
      }

      const { user } = await authResponse.json();

      // Add user role to headers for the page to use
      if (user?.role) {
        response.headers.set('x-user-role', user.role);
      }

      return response;
    } catch {
      // Authentication failed - logout and clear cookies
      await fetch(`${backendUrl}/lems/auth/logout`, {
        method: 'POST',
        headers: { Cookie: request.headers.get('cookie') || '' }
      });

      const homeUrl = basePath || '/';
      const redirectResponse = NextResponse.redirect(new URL(homeUrl, request.url));

      // Clear the cookie on the client side to prevent redirect loops
      redirectResponse.cookies.set('lems-auth-token', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
