'use client';

import { usePathname } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/ar') ? 'ar' : 'en';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1>404</h1>
      <BackButton
        href={`/${locale}`}
        label={locale === 'ar' ? 'العودة للرئيسية' : 'Back to home'}
      />
    </div>
  );
}
