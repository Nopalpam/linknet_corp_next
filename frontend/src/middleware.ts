import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_TOKEN_COOKIE = 'auth_token';

const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/mfa-verify',
  '/linknet-media',
  '/linknet-enterprise-coverage',
];

/**
 * Middleware only checks token presence, not validity.
 * Token validity is handled in AuthContext via the backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!token;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Keep auth pages reachable even when a stale token cookie exists, so the
  // client can clear expired auth data and allow the user to log in again.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
