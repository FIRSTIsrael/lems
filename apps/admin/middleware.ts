import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

  const publicPaths = ['/login'];
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    const response = await fetch(`${backendUrl}/admin/auth/verify`, {
      headers: { Cookie: request.headers.get('cookie') || '' }
    });

    if (!response.ok) {
      throw new Error('Admin authentication failed');
    }

    return NextResponse.next();
  } catch {
    await fetch(`${backendUrl}/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: request.headers.get('cookie') || '' }
    });
    return NextResponse.redirect(
      new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url)
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
};
