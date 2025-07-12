import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

  // Handle LEMS app authentication
  if (pathname.startsWith('/lems')) {
    // TODO
  }

  // Handle admin app authentication
  const adminPrefix = '/admin';
  if (pathname.startsWith(adminPrefix)) {
    const publicPaths = ['/login'];
    if (publicPaths.some(path => pathname == `${adminPrefix}${path}`)) {
      return NextResponse.next();
    }

    try {
      const response = await fetch(`${backendUrl}/admin/auth/verify`, {
        headers: {
          Cookie: request.headers.get('cookie') || ''
        }
      });

      if (!response.ok) {
        throw new Error('Admin authentication failed');
      }

      return NextResponse.next();
    } catch {
      await fetch(`${backendUrl}/admin/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: request.headers.get('cookie') || ''
        }
      });
      return NextResponse.redirect(
        new URL(`${adminPrefix}/login?returnUrl=${encodeURIComponent(pathname)}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lems/:path*', '/admin/:path*']
};
