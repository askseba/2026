"use client"
import { useState, useTransition, Suspense } from 'react'
import { useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { isLazyEnabled } from '@/lib/feature-flags'
import dynamic from 'next/dynamic'
import { Step3Allergy, type Step3AllergyProps } from '@/components/quiz/Step3Allergy'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useQuiz } from '@/contexts/QuizContext'
import { useQuizStepGuard } from '@/hooks/useQuizStepGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

function Step3AllergySkeleton() {
  return (
    <div className="min-h-[600px] animate-pulse" aria-hidden>
      <div className="h-8 w-48 rounded-lg bg-brand-brown/10 dark:bg-white/10 mb-6" />
      <div className="space-y-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-2xl bg-brand-brown/10 dark:bg-white/10" />
        ))}
      </div>
      <div className="flex gap-3 justify-between mt-8">
        <div className="h-12 w-28 rounded-xl bg-brand-brown/10 dark:bg-white/10" />
        <div className="h-12 w-28 rounded-xl bg-brand-brown/10 dark:bg-white/10" />
      </div>
    </div>
  )
}

const Step3AllergyLazy = dynamic<Step3AllergyProps>(
  () => import('@/components/quiz/Step3Allergy').then(m => ({ default: m.Step3Allergy })),
  {
    ssr: false,
    loading: () => <Step3AllergySkeleton />,
  }
)

interface AllergyData {
  level1: string[]
  level2: string[]
  level3: string[]
}

export default function Step3AllergyPage() {
  useQuizStepGuard(3)
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const router = useRouter()
  const t = useTranslations('quiz')
  const { data, setStep } = useQuiz()
  const [isPending, startTransition] = useTransition()

  const [allergy, setAllergy] = useState<AllergyData>(() => ({
    level1: data.step3_allergy?.symptoms || [],
    level2: data.step3_allergy?.families || [],
    level3: data.step3_allergy?.ingredients || []
  }))

  const updateAllergy = (newAllergy: AllergyData) => {
    setAllergy(newAllergy)
    setStep('step3_allergy', {
      symptoms: newAllergy.level1,
      families: newAllergy.level2,
      ingredients: newAllergy.level3
    })
  }

  const handleNext = () => {
    startTransition(() => {
      router.push('/results', { scroll: false })
    })
  }

  const handleBack = () => {
    startTransition(() => {
      router.push('/quiz/step2-disliked', { scroll: false })
    })
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream-bg dark:!bg-surface" dir={direction}>
      {isPending && (
        <div className="fixed inset-0 bg-cream-bg/80 dark:bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner type={3} message={t('step3.transitioning')} size="lg" />
        </div>
      )}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 rounded-full bg-primary dark:bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-primary dark:bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-primary dark:bg-amber-500" />
        </div>

        {isLazyEnabled('LAZY_STEP3_ALLERGY') ? (
          <Suspense fallback={<Step3AllergySkeleton />}>
            <Step3AllergyLazy
              allergy={allergy}
              updateAllergy={updateAllergy}
              onNext={handleNext}
              onBack={handleBack}
              isPending={isPending}
            />
          </Suspense>
        ) : (
          <Step3Allergy
            allergy={allergy}
            updateAllergy={updateAllergy}
            onNext={handleNext}
            onBack={handleBack}
            isPending={isPending}
          />
        )}
      </div>
    </div>
    </ErrorBoundary>
  )
}
