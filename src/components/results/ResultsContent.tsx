"use client"
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRightLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useQuiz } from '@/contexts/QuizContext'
import { type ScoredPerfume } from '@/lib/matching'
import { safeFetch } from '@/lib/utils/api-helpers'
import { UpsellCard } from '@/components/ui/UpsellCard'
import { BackButton } from '@/components/ui/BackButton'
import { CompareBottomSheet } from '@/components/results/CompareBottomSheet'
import { IngredientsSheet } from '@/components/results/IngredientsSheet'
import { MatchSheet } from '@/components/results/MatchSheet'
import ResultsGrid from '@/components/results/ResultsGrid'
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
  const { data: quizData } = useQuiz()
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

  const setComparePerfume = useCallback((perfume: ScoredPerfume | null) => {
    setPriceHubPerfume(perfume)
    setCompareMode('price-hub')
    if (perfume) setIsCompareOpen(true)
  }, [])

  const fetchResults = useCallback(async () => {
    setIsLoading(true)
    try {
      const payload = {
        preferences: {
          likedPerfumeIds: quizData?.step1_liked ?? [],
          dislikedPerfumeIds: quizData?.step2_disliked ?? [],
          allergyProfile: quizData?.step3_allergy ?? {}
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
  }, [quizData, t])

  useEffect(() => { fetchResults() }, [fetchResults])

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : 
      prev.length < 3 ? [...prev, id] : prev
    )
  }

  const direction = locale === 'ar' ? 'rtl' : 'ltr'

  const comparePerfumes = scoredPerfumes.filter((p) => compareIds.includes(p.id))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-bg dark:!bg-surface pb-20" dir={direction}>
        {/* Hero skeleton */}
        <div className="container mx-auto px-6 pt-6">
          <div className="h-5 w-40 bg-primary/10 dark:bg-surface-elevated rounded-full animate-pulse mb-6" />
        </div>

        {/* Hero section skeleton */}
        <section className="pt-16 pb-12 px-6 text-center">
          <div className="h-6 w-48 bg-primary/10 dark:bg-surface-elevated rounded-full animate-pulse mx-auto mb-6" />
          <div className="h-10 w-72 bg-primary/10 dark:bg-surface-elevated rounded-2xl animate-pulse mx-auto mb-4" />
          <div className="h-5 w-96 max-w-full bg-text-secondary/10 dark:bg-surface-elevated rounded-lg animate-pulse mx-auto" />
        </section>

        {/* Main grid skeleton */}
        <main className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface rounded-3xl shadow-elevation-1 dark:shadow-black/20 border border-primary/5 dark:border-border-subtle overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-cream-bg dark:bg-background" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-20 bg-primary/20 dark:bg-surface-elevated rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-text-primary/10 dark:bg-surface-elevated rounded animate-pulse" />
                  <div className="h-4 w-full bg-text-secondary/10 dark:bg-surface-elevated rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-text-secondary/10 dark:bg-surface-elevated rounded animate-pulse" />
                  <div className="h-10 w-full bg-primary/10 dark:bg-surface-elevated rounded-xl animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>

          {/* Upsell skeleton */}
          <div className="border-t border-primary/10 dark:border-border-subtle mt-12 pt-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-surface-elevated rounded-3xl shadow-elevation-1 dark:shadow-black/20 p-8 animate-pulse">
                <div className="h-12 w-32 bg-primary/10 dark:bg-surface-elevated rounded-full mx-auto mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-5 w-24 bg-primary/20 dark:bg-surface-elevated rounded animate-pulse" />
                      <div className="h-4 w-40 bg-text-secondary/10 dark:bg-surface-elevated rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-12 w-full bg-primary/10 dark:bg-surface-elevated rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    )
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
            className="px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium shadow-button"
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
          href={`/${locale}/dashboard`}
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
                    {excellent} {t('heroExcellent')}
                  </span>
                )}
                {good > 0 && (
                  <>
                    <span className="text-text-muted dark:text-text-muted">·</span>
                    <span className="text-sm font-bold text-primary dark:text-amber-500">
                      {good} {t('heroGood')}
                    </span>
                  </>
                )}
                {fair > 0 && (
                  <>
                    <span className="text-text-muted dark:text-text-muted">·</span>
                    <span className="text-sm font-medium text-amber-500 dark:text-amber-400">
                      {fair} {t('heroFair')}
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
                  ? '🟢 Fragella + IFRA (5K+ عطور)' 
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
      <ResultsGrid
        perfumes={scoredPerfumes.map((perfume) => ({
          ...perfume,
          displayName: perfume.name,
          onShowIngredients: () => setIngredientsPerfume(perfume),
          onShowMatch: () => setMatchPerfume(perfume),
          onPriceCompare: () => setComparePerfume(perfume),
        }))}
        tier={tier}
        compareIds={compareIds}
        toggleCompare={toggleCompare}
        blurredItems={blurredItems}
        t={t}
      />

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
        <div className="border-t border-primary/10 dark:border-border-subtle mt-12 pt-8 container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <UpsellCard
              position="bottom"
              remainingCount={blurredItems.length}
              averageMatch={Math.round(
                blurredItems.reduce((acc, item) => acc + item.matchScore, 0) /
                  (blurredItems.length || 1)
              )}
            />
          </motion.div>
        </div>
      )}
    </div>
  )
}
