/**
 * DreamTree Middleware
 *
 * Handles session validation and route protection.
 */

import { NextRequest, NextResponse } from 'next/server';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/api/auth/login', '/api/auth/signup'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/workbook', '/profile', '/tools', '/onboarding'];

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionId = request.cookies.get('dt_session')?.value;
  const isAuthenticated = !!sessionId;

  // Check if this is a public route
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Check if this is a protected route
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // API routes other than auth should check session in their handlers
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    // Let API routes handle their own auth
    return NextResponse.next();
  }

  // Authenticated users accessing login/signup should redirect to dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Unauthenticated users accessing protected routes should redirect to login
  if (!isAuthenticated && isProtectedRoute && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
