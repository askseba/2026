import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create i18n middleware
export default createMiddleware(routing);

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

