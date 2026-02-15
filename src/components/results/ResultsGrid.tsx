'use client'

import { motion } from 'framer-motion'
import { PerfumeCard } from '@/components/ui/PerfumeCard'
import { UpsellCard } from '@/components/ui/UpsellCard'
import { BlurredTeaserCard } from '@/components/ui/BlurredTeaserCard'
import type { ScoredPerfume } from '@/lib/matching'
import { cn } from '@/lib/classnames'

interface BlurredItem {
  id: string
  matchScore: number
  familyHint: string
}

interface ResultsGridProps {
  perfumes: Array<
    ScoredPerfume & {
      displayName?: string
      onShowIngredients: () => void
      onShowMatch: () => void
      onPriceCompare: () => void
    }
  >
  tier: 'GUEST' | 'FREE' | 'PREMIUM'
  compareIds: string[]
  toggleCompare: (id: string) => void
  blurredItems: BlurredItem[]
  t: (key: string, opts?: Record<string, string | number | Date>) => string
}

export default function ResultsGrid({
  perfumes,
  tier,
  compareIds,
  toggleCompare,
  blurredItems,
  t,
}: ResultsGridProps) {
  const items: React.ReactNode[] = []

  perfumes.forEach((perfume, index) => {
    items.push(
      <motion.div
        key={perfume.id}
        className={cn(
          'relative transition-opacity',
          perfume.finalScore < 40 && 'opacity-60'
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: Math.min(index * 0.08, 0.5),
          duration: 0.3,
        }}
      >
        {perfume.finalScore < 40 && (
          <div className="absolute top-2 inset-x-0 z-20 flex justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full shadow-sm">
              {t('poorMatch')}
            </span>
          </div>
        )}
        <PerfumeCard
          {...perfume}
          displayName={perfume.displayName ?? perfume.name}
          ifraScore={perfume.ifraScore}
          symptomTriggers={perfume.symptomTriggers ?? []}
          ifraWarnings={perfume.ifraWarnings}
          source={perfume.source}
          showCompare={true}
          isComparing={compareIds.includes(perfume.id)}
          onCompare={() => toggleCompare(perfume.id)}
          priority={index < 2}
          isFirst={index === 0}
          perfumeData={perfume}
        />
      </motion.div>
    )

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
            remainingCount={blurredItems.length + (perfumes.length - index - 1)}
            averageMatch={Math.round(
              blurredItems.reduce((acc, item) => acc + item.matchScore, 0) /
                (blurredItems.length || 1)
            )}
          />
        </motion.div>
      )
    }
  })

  if (tier !== 'PREMIUM' && blurredItems.length > 0) {
    items.push(
      <motion.div
        key="blurred-teaser"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          delay: Math.min(perfumes.length * 0.08, 0.6),
          duration: 0.4,
        }}
        className="col-span-1"
      >
        <BlurredTeaserCard
          items={blurredItems.map((item) => ({
            name: t('blurred.hiddenPerfume'),
            brand: item.familyHint,
            matchScore: item.matchScore,
          }))}
          tier={tier}
          matchRange={`${Math.min(...blurredItems.map((i) => i.matchScore))}-${Math.max(...blurredItems.map((i) => i.matchScore))}%`}
        />
      </motion.div>
    )
  }

  return (
    <main className="container mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items}
      </div>
    </main>
  )
}
