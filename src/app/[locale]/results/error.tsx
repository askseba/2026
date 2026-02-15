'use client'

import { useLocale, useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ResultsError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error // required by Next.js error boundary; intentionally unused for display
  const t = useTranslations('results')
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream-bg dark:!bg-surface gap-6 px-4" dir={direction}>
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-2">
          {t('errorMessage')}
        </h2>
        <p className="text-text-secondary dark:text-text-muted mb-6">
          {t('errorDefault')}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
          >
            {t('retry')}
          </button>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white dark:bg-surface-elevated text-text-primary dark:text-text-primary rounded-xl border border-primary/20 dark:border-border-subtle hover:bg-primary/5 transition font-medium"
          >
            {t('backToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  )
}
