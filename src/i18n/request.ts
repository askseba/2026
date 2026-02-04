import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Prefer segment [locale], then middleware header, then default
  let locale = await requestLocale;
  if (!locale || !hasLocale(routing.locales, locale)) {
    const headersList = await headers();
    const headerLocale = headersList.get('x-next-intl-locale');
    locale = hasLocale(routing.locales, headerLocale ?? '')
      ? headerLocale!
      : routing.defaultLocale;
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  return { locale, messages };
});
