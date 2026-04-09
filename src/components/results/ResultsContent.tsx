"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRightLeft, Zap } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { PerfumeCard } from '@/components/ui/PerfumeCard'
import { Button } from '@/components/ui/button'
import { useQuiz } from '@/contexts/QuizContext'
import { useSession } from 'next-auth/react'
import { type ScoredPerfume } from '@/lib/matching'
import { safeFetch } from '@/lib/utils/api-helpers'
import { UpsellCard } from '@/components/ui/UpsellCard'
import { BackButton } from '@/components/ui/BackButton'
import { CompareBottomSheet } from '@/components/results/CompareBottomSheet'
import { IngredientsSheet } from '@/components/results/IngredientsSheet'
import { MatchSheet } from '@/components/results/MatchSheet'
import { ResultsLoadingScreen } from '@/components/results/ResultsLoadingScreen'
import { cn } from '@/lib/classnames'
import logger from '@/lib/logger'

interface BlurredItem {
  id: string
  matchScore: number
  familyHint: string
}

interface MatchResponse {
  success: boolean
  perfumes: ScoredPerfume[]
  blurredItems?: BlurredItem[]
  tier: 'GUEST' | 'FREE' | 'PREMIUM'
}

export function ResultsContent() {
  const locale = useLocale()
  const t = useTranslations('results')
  const { data: quizData, isHydrated } = useQuiz()
  const { data: session } = useSession()
  const [scoredPerfumes, setScoredPerfumes] = useState<ScoredPerfume[]>([])
  const [blurredItems, setBlurredItems] = useState<BlurredItem[]>([])
  const [tier, setTier] = useState<'GUEST' | 'FREE' | 'PREMIUM'>('GUEST')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [compareMode, setCompareMode] = useState<'compare' | 'price-hub'>('compare')
  const [priceHubPerfume, setPriceHubPerfume] = useState<ScoredPerfume | null>(null)
  const [ingredientsPerfume, setIngredientsPerfume] = useState<ScoredPerfume | null>(null)
  const [matchPerfume, setMatchPerfume] = useState<ScoredPerfume | null>(null)

  const step1Liked = quizData?.step1_liked ?? []
  const step2Disliked = quizData?.step2_disliked ?? []
  const step3Allergy = quizData?.step3_allergy ?? { symptoms: [], families: [], ingredients: [] }

  const fetchResults = useCallback(async () => {
    setIsLoading(true)
    try {
      const payload = {
        preferences: {
          likedPerfumeIds: step1Liked,
          dislikedPerfumeIds: step2Disliked,
          allergyProfile: step3Allergy ?? {}
        }
      }
      const data = await safeFetch<MatchResponse>('/api/match', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (data.success) {
        setScoredPerfumes(data.perfumes)
        setBlurredItems(data.blurredItems || [])
        setTier(data.tier)
      }
    } catch (err) {
      logger.error('Results fetch error:', err)
      setError(t('errorDefault'))
    } finally {
      setIsLoading(false)
    }
  }, [step1Liked, step2Disliked, step3Allergy, t])

  useEffect(() => {
    if (!isHydrated) return
    if (step1Liked.length < 3) {
      setIsLoading(false)
      return
    }
    fetchResults()
  }, [fetchResults, isHydrated])

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : 
      prev.length < 3 ? [...prev, id] : prev
    )
  }

  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  const comparePerfumes = scoredPerfumes.filter((p) => compareIds.includes(p.id))

  // Calculate summary statistics for Hero
  const lockedCount = blurredItems.length
  const totalCount = scoredPerfumes.length + (lockedCount || 0)
  const topScore = scoredPerfumes.length > 0 ? Math.round(scoredPerfumes[0].finalScore) : 0

  // V1: no quiz context → empty state only (no history fallback)
  if (isHydrated && step1Liked.length < 3 && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-bg dark:!bg-surface gap-4 px-6" dir={direction}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary dark:text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary mb-2">
            {locale === 'ar' ? 'لا توجد نتائج محفوظة' : 'No results available'}
          </h2>
          <p className="text-text-secondary dark:text-text-secondary mb-6">
            {locale === 'ar'
              ? 'أكمل الاختبار للحصول على توصيات مخصصة لك'
              : 'Complete the quiz to get personalized recommendations'}
          </p>
          <Button
            onClick={() => { window.location.href = `/${locale}/quiz/step1-favorites` }}
            className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 rounded-xl"
          >
            {locale === 'ar' ? 'ابدأ الاختبار' : 'Start Quiz'}
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <ResultsLoadingScreen direction={direction} />
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream-bg dark:!bg-surface gap-4" dir={direction}>
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-600 dark:text-red-400 mb-6">{t('errorMessage')}</p>
          <button
            onClick={() => {
              setError(null)
              fetchResults()
            }}
            className="px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-700 rounded-xl hover:opacity-90 transition font-medium shadow-button"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-cream-bg dark:!bg-surface pb-20" dir={direction}>
      <div className="container mx-auto px-6 pt-6">
        <BackButton
          href="/dashboard"
          label={t('backToDashboard')}
          variant="link"
          className="mb-6"
        />
      </div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 dark:from-amber-500/10 to-transparent pt-16 pb-12 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-surface-elevated/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 dark:border-border-subtle mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary dark:text-amber-500" />
            <span className="text-sm font-bold text-text-primary dark:text-text-primary">{t('hero.badge')}</span>
          </div>

          {/* H1 Title */}
          <h1 className="text-3xl md:text-4xl font-black text-text-primary dark:text-text-primary mb-6">
            {t('hero.title')}
          </h1>

          {/* Summary Strip - تصنيف ديناميكي */}
          {scoredPerfumes.length > 0 && (() => {
            const excellent = scoredPerfumes.filter(p => p.finalScore >= 80).length
            const good = scoredPerfumes.filter(p => p.finalScore >= 60 && p.finalScore < 80).length
            const fair = scoredPerfumes.filter(p => p.finalScore >= 40 && p.finalScore < 60).length
            
            return (
              <div className="flex items-center gap-3 flex-wrap justify-center mb-8 px-4">
                {excellent > 0 && (
                  <span className="text-sm font-bold text-safe-green dark:text-green-400">
                    {locale === 'ar' ? `${excellent} عطور ممتازة` : `${excellent} ${t('heroExcellent')}`}
                  </span>
                )}
                {good > 0 && (
                  <>
                    <span className="text-text-muted dark:text-text-muted">·</span>
                    <span className="text-sm font-bold text-primary dark:text-amber-500">
                      {locale === 'ar' ? `${good} عطور جيدة` : `${good} ${t('heroGood')}`}
                    </span>
                  </>
                )}
                {fair > 0 && (
                  <>
                    <span className="text-text-muted dark:text-text-muted">·</span>
                    <span className="text-sm font-medium text-amber-500 dark:text-amber-400">
                      {locale === 'ar' ? `${fair} عطور مقبولة` : `${fair} ${t('heroFair')}`}
                    </span>
                  </>
                )}
              </div>
            )
          })()}

          {/* Source Indicator */}
          {scoredPerfumes.length > 0 && (() => {
            const fragellaCount = scoredPerfumes.filter(p => p.source === 'fragella').length
            const isFragellaMode = fragellaCount > 0 || scoredPerfumes.length > 19
            
            return (
              <div className="text-xs text-text-muted dark:text-text-muted mt-2 mb-4">
                {isFragellaMode 
                  ? '🟢 Fragella + IFRA'
                  : '🟡 Demo Mode (19 عطر)'
                }
              </div>
            )
          })()}

          {/* Description */}
          <p className="text-text-secondary dark:text-text-muted max-w-2xl mx-auto text-lg">
            {t('hero.description')}
          </p>
        </motion.div>
      </section>

      {/* Comparison Bar (Sticky) */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl bg-white dark:bg-surface-elevated rounded-2xl shadow-elevation-3 border border-primary/20 dark:border-border-subtle p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 dark:bg-amber-500/20 p-2 rounded-lg"><ArrowRightLeft className="w-5 h-5 text-primary dark:text-amber-500" /></div>
              <div>
                <p className="font-bold text-text-primary dark:text-text-primary text-sm">{t('compare.title')} {t('compare.count', { count: compareIds.length })}</p>
                <p className="text-xs text-text-secondary dark:text-text-muted">{t('compare.subtitle')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>{t('compare.cancel')}</Button>
              <Button
                size="sm"
                disabled={compareIds.length < 2}
                onClick={() => {
                  if (compareIds.length >= 2) {
                    setCompareMode('compare')
                    setIsCompareOpen(true)
                  }
                }}
              >
                {t('compare.action')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scoredPerfumes.map((perfume, index) => {
            const items = [];
            
            // Perfume Card
            items.push(
              <motion.div
                key={perfume.id}
                className={cn("relative transition-opacity", perfume.finalScore < 40 && "opacity-60")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.08, 0.5),
                  duration: 0.3
                }}
              >
                {/* Label تطابق ضعيف فوق البطاقة */}
                {perfume.finalScore < 40 && (
                  <div className="absolute top-2 inset-x-0 z-20 flex justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full shadow-sm">
                      {t('poorMatch')}
                    </span>
                  </div>
                )}
                <PerfumeCard
                  {...perfume}
                  ifraScore={perfume.ifraScore}
                  symptomTriggers={perfume.symptomTriggers}
                  ifraWarnings={perfume.ifraWarnings}
                  source={perfume.source}
                  showCompare={true}
                  isComparing={compareIds.includes(perfume.id)}
                  onCompare={() => toggleCompare(perfume.id)}
                  priority={index < 2}
                  isFirst={index === 0}
                  onShowIngredients={() => setIngredientsPerfume(perfume)}
                  onShowMatch={() => setMatchPerfume(perfume)}
                  onPriceCompare={(p) => {
                    setPriceHubPerfume(p)
                    setCompareMode('price-hub')
                    setIsCompareOpen(true)
                  }}
                  perfumeData={perfume}
                />
              </motion.div>
            );

            // Mid-grid UpsellCard (After 4th result for Free users)
            if (index === 3 && tier === 'FREE') {
              items.push(
                <motion.div
                  key="upsell-mid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <UpsellCard 
                    position="mid-grid"
                    remainingCount={blurredItems.length + (scoredPerfumes.length - index - 1)}
                    averageMatch={Math.round(blurredItems.reduce((acc, item) => acc + item.matchScore, 0) / (blurredItems.length || 1))}
                  />
                </motion.div>
              );
            }

            return items;
          })}
        </div>

        <CompareBottomSheet
          isOpen={isCompareOpen}
          onClose={() => {
            setIsCompareOpen(false)
            setPriceHubPerfume(null)
          }}
          mode={compareMode}
          perfumes={compareMode === 'compare' ? comparePerfumes : undefined}
          perfume={compareMode === 'price-hub' ? priceHubPerfume ?? undefined : undefined}
          tier={tier}
          locale={locale}
        />

        {/* Ingredients and Match Sheets */}
        <AnimatePresence mode="wait">
          {ingredientsPerfume && (
            <IngredientsSheet 
              key="ingredients" 
              perfume={ingredientsPerfume} 
              onClose={() => setIngredientsPerfume(null)} 
              locale={locale} 
            />
          )}
          {matchPerfume && (
            <MatchSheet 
              key="match" 
              perfume={matchPerfume} 
              onClose={() => setMatchPerfume(null)} 
              locale={locale} 
            />
          )}
        </AnimatePresence>

        {/* Upsell zone with divider */}
        {tier !== 'PREMIUM' && (
          <div className="border-t border-primary/10 dark:border-border-subtle mt-12 pt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <UpsellCard 
                position="bottom"
                remainingCount={blurredItems.length}
                averageMatch={Math.round(blurredItems.reduce((acc, item) => acc + item.matchScore, 0) / (blurredItems.length || 1))}
              />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}
