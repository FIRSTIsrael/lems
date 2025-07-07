import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ['/login'];
  const adminPaths = ['/admin'];
  const path = pathname.split('?')[0];

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';
    const response = await fetch(`${backendUrl}/api/me`, {
      headers: {
        Cookie: request.headers.get('cookie') || ''
      }
    });

    if (!response.ok && !publicPaths.includes(path)) {
      await fetch(`${backendUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: request.headers.get('cookie') || ''
        }
      });

      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (adminPaths.some(adminPath => path.startsWith(adminPath))) {
      const user = await response.json();
      if (!user.isAdmin) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // User is logged in
    return NextResponse.next();
  } catch {
    // Error when authenticating
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except API routes, static files, and Next.js internals
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)'
  ]
};
