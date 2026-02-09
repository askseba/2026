'use client';

import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/BackButton';

export function NotFoundContent() {
  const locale = useLocale();
  const t = useTranslations('notFound');
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={direction}
      className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:!from-background dark:!to-surface px-4"
    >
      <div className="container mx-auto px-4 py-8 max-w-md">
        <BackButton href="/" label={t('backHome')} variant="link" className="mb-6" />
        <div className="text-center space-y-4 pt-8">
          <div className="mb-6 flex justify-center">
            <AlertTriangle className="w-20 h-20 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-brown-text dark:text-text-primary mb-4">
            {t('title')}
          </h1>
          <p className="text-brown-text/70 dark:text-text-secondary mb-8 text-lg leading-relaxed">
            {t('description')}
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <Button asChild size="lg" className="w-full min-h-[52px] bg-primary text-white hover:bg-primary/90 dark:bg-accent-primary dark:text-white dark:hover:bg-accent-primary/90">
              <Link href="/">{t('backHome')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/quiz/step1-favorites">{t('browseQuiz')}</Link>
            </Button>
          </div>
          <div className="pt-6 border-t border-brown-text/10 dark:border-border-subtle">
            <p className="text-sm text-brown-text/60 dark:text-text-muted mb-4">{t('quickLinks')}</p>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <Link
                href="/"
                className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              >
                {t('home')}
              </Link>
              <span className="text-brown-text/40 dark:text-text-muted">•</span>
              <Link
                href="/quiz/step1-favorites"
                className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              >
                {t('quiz')}
              </Link>
              <span className="text-brown-text/40 dark:text-text-muted">•</span>
              <Link
                href="/favorites"
                className="text-sm text-brown-text/60 dark:text-text-muted hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1"
              >
                {t('favorites')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
