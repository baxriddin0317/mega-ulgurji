import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('__session');

    if (!session?.value) {
      // No session cookie — redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode the session cookie (base64 JSON with role)
      const sessionData = JSON.parse(atob(session.value));
      if (sessionData.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Invalid cookie — redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
