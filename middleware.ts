import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Skip middleware for auth, static files, and public pages
  const path = request.nextUrl.pathname;
  
  const isPublicPath = 
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/login') ||
    path.startsWith('/signup') ||
    path === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For now, allow all requests (we'll add auth check later)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};