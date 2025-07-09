// middleware.js
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'fa'],

  // Used when no locale matches
  defaultLocale: 'fa', // Default to Farsi

  // Don't internationalize routes starting with these paths
  // We might want to exclude /api, /_next/static, /_next/image, /favicon.ico, etc.
  // For now, let's assume all routes should be internationalized unless specified otherwise.
  // Admin panel might also be a candidate for exclusion or its own i18n setup.
  // For now, we'll include it in the main i18n.
  // localePrefix: 'as-needed', // or 'always' or 'never'
});

export const config = {
  // Match only internationalized pathnames
  // Skip paths that should not be internationalized (e.g. API routes, static files)
  matcher: [
    // Match all routes except for assets and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    // Optional: Match specific paths if you want more control
    // '/(en|fa)/:path*'
  ]
};
