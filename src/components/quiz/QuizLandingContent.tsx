'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import content from '@/content'

export function QuizLandingContent() {
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-background via-surface-muted to-muted dark:from-slate-950/95 dark:to-slate-900/95 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-accent-primary to-orange-500 bg-clip-text text-transparent">
          {content.quiz.title}
        </h1>

        <p className="text-xl md:text-2xl text-foreground/80 max-w-md mx-auto leading-relaxed">
          {content.quiz.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" href="/quiz/step1-favorites" className="min-h-[52px] w-full sm:w-auto !bg-gradient-to-r !from-amber-500 !to-amber-700 !text-white font-bold shadow-lg hover:shadow-xl">
            {content.quiz.startButton}
          </Button>
          <Button variant="outline" size="lg" href="/" className="min-h-[52px] w-full sm:w-auto">
            <ChevronLeft className="h-5 w-5 mr-2" />
            العودة
          </Button>
        </div>
      </div>
    </div>
  )
}
