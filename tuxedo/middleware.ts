import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Prevent redirect loop: never redirect when path already has a locale
  if (pathname.startsWith('/ar') || pathname.startsWith('/en')) {
    return NextResponse.next();
  }

  // Skip API, Next internals, Vercel, static assets (no redirect)
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel')
  ) {
    return NextResponse.next();
  }
  if (pathname.includes('.')) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

// Middleware configuration
export const config = {
  // Match all pathnames except:
  // - API routes (/api/*)
  // - Next.js internals (/_next/*)
  // - Static files (files with extensions)
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Also match locale-prefixed routes
    '/(ar|en)/:path*'
  ]
};
