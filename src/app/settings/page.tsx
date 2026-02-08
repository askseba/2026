import { getLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';

export default async function SettingsRedirect() {
  const locale = await getLocale();
  redirect({ href: '/profile', locale });
}
