import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

  // Handle LEMS app authentication
  if (pathname.startsWith('/lems')) {
    // TODO
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/lems/:path*']
};
