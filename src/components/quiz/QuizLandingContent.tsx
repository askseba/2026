'use client'

import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import content from '@/content'
import { BackButton } from '@/components/ui/BackButton'

export function QuizLandingContent() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  return (
    <div dir={direction} className="min-h-screen bg-gradient-to-br from-background via-surface-muted to-muted dark:from-slate-950/95 dark:to-slate-900/95 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <BackButton variant="link" className="mb-6" />
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-primary to-orange-500 bg-clip-text text-transparent">
            {content.quiz.title}
          </h1>

          <p className="text-xl md:text-2xl text-foreground/80 max-w-md mx-auto leading-relaxed">
            {content.quiz.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="min-h-[52px] w-full sm:w-auto !bg-gradient-to-r !from-amber-500 !to-amber-700 !text-white font-bold shadow-lg hover:shadow-xl">
              <Link href="/quiz/step1-favorites">{content.quiz.startButton}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
