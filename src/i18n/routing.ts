import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Available locales
  locales: ['ar', 'en'],
  
  // Default locale (Arabic)
  defaultLocale: 'ar',
  
  // Locale prefix strategy: always so /ar and /en both work (user requested /ar)
  localePrefix: 'always'
});

// Create type-safe navigation utilities
export const { Link, redirect, usePathname, useRouter, getPathname } = 
  createNavigation(routing);
