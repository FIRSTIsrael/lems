import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle LEMS app authentication
  if (pathname.startsWith('/lems')) {
    // TODO
  }

  // Handle admin app authentication
  if (pathname.startsWith('/admin')) {
    // TODO
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lems/:path*', '/admin/:path*']
};
