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
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { UpsellCard } from '@/components/ui/UpsellCard'
import { BlurredTeaserCard } from '@/components/ui/BlurredTeaserCard'
import { BackButton } from '@/components/ui/BackButton'
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
  const { data: session } = useSession()
  const [scoredPerfumes, setScoredPerfumes] = useState<ScoredPerfume[]>([])
  const [blurredItems, setBlurredItems] = useState<BlurredItem[]>([])
  const [tier, setTier] = useState<'GUEST' | 'FREE' | 'PREMIUM'>('GUEST')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compareIds, setCompareIds] = useState<string[]>([])

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
      setError('فشل تحميل النتائج')
    } finally {
      setIsLoading(false)
    }
  }, [quizData])

  useEffect(() => { fetchResults() }, [fetchResults])

  const toggleCompare = (id: string) => {
    setCompareIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : 
      prev.length < 3 ? [...prev, id] : prev
    )
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-cream-bg dark:!bg-surface"><LoadingSpinner size="lg" /></div>

  const direction = locale === 'ar' ? 'rtl' : 'ltr'
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
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-surface-elevated/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20 dark:border-border-subtle mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-primary dark:text-amber-500" />
            <span className="text-sm font-bold text-text-primary dark:text-text-primary">تم تحليل ذوقك بنجاح</span>
          </div>
          <p className="text-text-secondary dark:text-text-muted max-w-2xl mx-auto text-lg">بناءً على تفضيلاتك، قمنا باختيار هذه العطور التي تناسب شخصيتك وتتجنب مسببات الحساسية لديك.</p>
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
                <p className="font-bold text-text-primary dark:text-text-primary text-sm">مقارنة العطور ({compareIds.length}/3)</p>
                <p className="text-xs text-text-secondary dark:text-text-muted">قارن المكونات والسعر والأداء</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareIds([])}>إلغاء</Button>
              <Button size="sm" disabled={compareIds.length < 2}>قارن الآن</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Grid */}
      <main className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scoredPerfumes.map((perfume, index) => {
            const items = [];
            
            // Perfume Card
            items.push(
              <motion.div 
                key={perfume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
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

          {/* Blurred Teaser Cards */}
          {tier !== 'PREMIUM' && blurredItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: scoredPerfumes.length * 0.1 }}
              className="col-span-1"
            >
              <BlurredTeaserCard 
                items={blurredItems.map(item => ({
                  name: 'عطر مخفي',
                  brand: item.familyHint,
                  matchScore: item.matchScore
                }))}
                tier={tier}
                matchRange={`${Math.min(...blurredItems.map(i => i.matchScore))}-${Math.max(...blurredItems.map(i => i.matchScore))}%`}
              />
            </motion.div>
          )}
        </div>

        {/* Final Bottom UpsellCard */}
        {tier !== 'PREMIUM' && (
          <div className="mt-16">
            <UpsellCard 
              position="bottom"
              remainingCount={blurredItems.length}
              averageMatch={Math.round(blurredItems.reduce((acc, item) => acc + item.matchScore, 0) / (blurredItems.length || 1))}
            />
          </div>
        )}
      </main>
    </div>
  )
}
