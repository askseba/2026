'use client'

import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/ui/BackButton'
import { useSession } from 'next-auth/react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export function FavoritesContent() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const t = useTranslations('favorites')
  const router = useRouter()
  const { status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-bg dark:!bg-surface">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div dir={direction} className="min-h-screen bg-cream-bg dark:!bg-surface text-brand-brown dark:text-text-primary pb-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <BackButton
          variant="link"
          href={status === 'authenticated' ? '/dashboard' : '/'}
          label={status === 'authenticated' ? t('backToDashboard') : t('backToHome')}
          className="mb-6"
        />

        <div className="text-center py-16 bg-white dark:bg-surface rounded-[2.5rem] border border-dashed border-primary/20 dark:border-border-subtle">
          <div className="bg-primary/10 dark:bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-brand-brown dark:text-text-primary mb-2">{t('title')}</h1>
          <h2 className="text-xl font-bold text-brand-brown dark:text-text-primary mb-2">{t('emptyTitle')}</h2>
          <p className="text-brand-brown/70 dark:text-text-secondary text-sm mb-8">{t('emptyDescription')}</p>
          <Button onClick={() => router.push('/results')}>{t('exploreCta')}</Button>
        </div>
      </div>
    </div>
  )
}
