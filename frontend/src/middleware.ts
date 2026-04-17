import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Constants
const AUTH_TOKEN_COOKIE = 'auth_token';

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/mfa-verify',
  '/linknet-media',
  '/linknet-enterprise-coverage',
];

// Define routes that should redirect to dashboard if authenticated
const AUTH_REDIRECT_ROUTES = ['/login', '/forgot-password', '/reset-password'];

/**
 * Middleware untuk mengecek authentication SEBELUM page render
 * Ini mencegah flicker karena auth check dilakukan di server-side
 * 
 * IMPORTANT: Middleware HANYA mengecek keberadaan token, BUKAN validitasnya.
 * Validasi token dilakukan di AuthContext dengan call ke backend.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookie
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const isAuthenticated = !!token;
  
  console.log(`🔵 Middleware: ${pathname} - Token: ${isAuthenticated ? 'EXISTS' : 'MISSING'}`);
  
  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // Check if current route should redirect authenticated users
  const isAuthRedirectRoute = AUTH_REDIRECT_ROUTES.some(route => pathname.startsWith(route));

  // Case 1: User is NOT authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicRoute) {
    console.log('🔴 Middleware: No token - redirecting to login');
    const loginUrl = new URL('/login', request.url);
    // Add return URL for redirect after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: User IS authenticated and trying to access auth pages (login, etc)
  if (isAuthenticated && isAuthRedirectRoute) {
    console.log('🔵 Middleware: Has token but on auth page - redirecting to dashboard');
    // Get return URL if exists, otherwise go to dashboard
    const returnUrl = request.nextUrl.searchParams.get('from') || '/';
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  // Case 3: Allow request to proceed
  // Note: Token validity will be checked by AuthContext on client-side
  return NextResponse.next();
}

/**
 * Configure which routes should run through middleware
 * Exclude: _next/static, _next/image, favicon.ico, public files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)',
  ],
};
