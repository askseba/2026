'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Twitter, Instagram, Mail } from 'lucide-react'

const linkClassName =
  '!inline-flex !items-center !justify-center !min-h-[44px] !min-w-[44px] !transition-colors !text-[rgb(var(--color-accent-primary))] hover:!text-[rgb(var(--color-accent-primary))] touch-manipulation'

export function Footer() {
  const locale = useLocale()
  const t = useTranslations('footer')
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <footer
      dir={dir}
      className="bg-white dark:bg-slate-900/50 border-t border-border-subtle dark:border-slate-700/50 py-6 px-4"
    >
      <div className="container mx-auto max-w-6xl">
        {/* Nav row: rich text so links are real <Link>s; locale comes from routing, no /ar hardcoded */}
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 mb-6"
          aria-label={t('navAriaLabel')}
        >
          {t.rich('linksRich', {
            about: (chunks) => (
              <Link href="/about" className={linkClassName}>
                {chunks}
              </Link>
            ),
            faq: (chunks) => (
              <Link href="/faq" className={linkClassName}>
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className={linkClassName}>
                {chunks}
              </Link>
            ),
            feedback: (chunks) => (
              <Link href="/feedback" className={linkClassName}>
                {chunks}
              </Link>
            ),
          })}
        </nav>

        {/* Icons row – dark:fill-amber-300 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <a
            href="mailto:support@askseba.com"
            className="!flex !items-center !justify-center !min-h-[44px] !min-w-[44px] !transition-colors !text-[rgb(var(--color-accent-primary))] hover:!text-[rgb(var(--color-accent-primary))] [&_svg]:dark:!fill-amber-200 touch-manipulation"
            aria-label={t('social.emailAriaLabel')}
          >
            <Mail className="w-5 h-5" aria-hidden="true" />
          </a>
          <a
            href="https://instagram.com/askseba"
            target="_blank"
            rel="noopener noreferrer"
            className="!flex !items-center !justify-center !min-h-[44px] !min-w-[44px] !transition-colors !text-[rgb(var(--color-accent-primary))] hover:!text-[rgb(var(--color-accent-primary))] [&_svg]:dark:!fill-amber-200 touch-manipulation"
            aria-label={t('social.instagramAriaLabel')}
          >
            <Instagram className="w-5 h-5" aria-hidden="true" />
          </a>
          <a
            href="https://twitter.com/askseba"
            target="_blank"
            rel="noopener noreferrer"
            className="!flex !items-center !justify-center !min-h-[44px] !min-w-[44px] !transition-colors !text-[rgb(var(--color-accent-primary))] hover:!text-[rgb(var(--color-accent-primary))] [&_svg]:dark:!fill-amber-200 touch-manipulation"
            aria-label={t('social.twitterAriaLabel')}
          >
            <Twitter className="w-5 h-5" aria-hidden="true" />
          </a>
        </div>

        {/* Copyright – dark:text-slate-400 */}
        <div className="!border-t !border-slate-200 dark:!border-slate-800 pt-4 text-center">
          <p className="!text-[rgb(var(--color-accent-primary))] text-sm">
            {t('legal.rights', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  )
}
