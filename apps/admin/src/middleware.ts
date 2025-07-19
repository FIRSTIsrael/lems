import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const backendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3333';

//   try {
//     const response = await fetch(`${backendUrl}/admin/auth/verify`, {
//       headers: { Cookie: request.headers.get('cookie') || '' }
//     });

//     if (!response.ok) {
//       throw new Error('Admin authentication failed');
//     }

//     return NextResponse.next();
//   } catch {
//     await fetch(`${backendUrl}/admin/auth/logout`, {
//       method: 'POST',
//       headers: { Cookie: request.headers.get('cookie') || '' }
//     });

//     return NextResponse.redirect(
//       new URL(`/login?returnUrl=${encodeURIComponent(pathname)}`, request.url)
//     );
//   }
// }

// export const config = {
//   // Run on all paths except /login
//   matcher: ['/', '/((?!login).*)']
// };
