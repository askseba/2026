'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SafetyBlocker } from '@/components/SafetyBlocker'
import { cn } from '@/lib/classnames'
import type { ScoredPerfume } from '@/lib/matching'
import { canShowPurchaseLinks } from '@/utils/safetyProtocol'
import { fetchPrices, type PriceApiResponse, type StorePriceData } from '@/types/api'

export type CompareMode = 'compare' | 'price-hub'

export interface CompareBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  mode: CompareMode
  perfumes?: ScoredPerfume[]
  perfume?: ScoredPerfume
  tier?: 'GUEST' | 'FREE' | 'PREMIUM'
  locale: string
}

// --- Mode B: Price Hub (Gold1 Store Cards) ---
interface StoreCardProps {
  store: StorePriceData
  t: (key: string, values?: Record<string, string>) => string
}

function StoreCard ({ store, t }: StoreCardProps) {
  return (
    <div className="bg-white dark:bg-surface border border-gray-200 dark:border-border-subtle rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-text-primary dark:text-text-primary">{store.name}</h3>
        {store.verified && (
          <span className="text-xs bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded-full border border-green-200 dark:border-green-500/30">
            {t('verifiedPrice')}
          </span>
        )}
      </div>
      {store.price != null && store.price > 0 ? (
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-orange-600 dark:text-amber-500">
              {store.price}
              <span className="text-lg ml-1">{store.currency}</span>
            </p>
            {store.verified && store.lastUpdated && (
              <p className="text-xs text-muted-foreground dark:text-text-muted mt-1">
                {new Date(store.lastUpdated).toLocaleDateString('ar-SA')}
              </p>
            )}
          </div>
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-orange-500 hover:bg-orange-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition"
          >
            Shop Now
          </a>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground dark:text-text-muted">{t('checkAvailability')}</p>
          <a
            href={store.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 dark:text-amber-500 font-semibold flex items-center gap-1 hover:underline"
          >
            {t('exploreIn', { store: store.name })} →
          </a>
        </div>
      )}
    </div>
  )
}

const PremiumGate = ({ hiddenStoresCount }: { hiddenStoresCount: number }) => {
  const t = useTranslations('results.compare')
  return (
    <div className="relative mt-6">
      {/* Blurred hidden stores */}
      <div className="blur-sm pointer-events-none opacity-50 space-y-3">
        {Array(hiddenStoresCount).fill(0).map((_, idx) => (
          <div key={idx} className="bg-gray-100 dark:bg-surface-muted rounded-xl p-4 h-24 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-border-subtle rounded w-3/4 mb-2" />
          </div>
        ))}
      </div>
      {/* CTA overlay */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 dark:from-amber-950/80 dark:via-amber-900/90 dark:to-amber-950/80 border-2 border-amber-400 dark:border-amber-500 rounded-2xl p-8 shadow-2xl backdrop-blur-sm max-w-md text-center transform hover:scale-105 transition-transform">
          <div className="text-5xl mb-4">👑</div>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2">{t('premiumGateTitle')}</h3>
          <p className="text-amber-800 dark:text-amber-200 mb-6 leading-relaxed">{t('premiumGateDesc')}</p>
          <button
            type="button"
            className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-8 py-3 rounded-full font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            {t('premiumGateButton')}
          </button>
        </div>
      </div>
    </div>
  )
}

function PriceHubContent ({
  perfume,
  tier,
  onClose,
  t,
  locale
}: {
  perfume: ScoredPerfume
  tier?: 'GUEST' | 'FREE' | 'PREMIUM'
  onClose: () => void
  t: (key: string, values?: Record<string, string>) => string
  locale: string
}) {
  void locale
  const [priceData, setPriceData] = useState<PriceApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!perfume?.id) return
    let cancelled = false
    async function run() {
      setError(null)
      setIsLoading(true)
      try {
        const res = await fetchPrices(perfume.id)
        if (cancelled) return
        if (res.success && res.data) setPriceData(res)
        else setError(t('tempError'))
      } catch {
        if (!cancelled) setError(t('tempError'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [perfume?.id, t])

  const stores = priceData?.data?.stores ?? []
  const hasStores = stores.length > 0

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sticky Header (Mode B only) */}
      {perfume && (
        <div className="sticky top-0 bg-white dark:bg-surface z-10 px-6 py-4 border-b border-primary/5 dark:border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl bg-cream-bg dark:bg-background p-2 flex-shrink-0 overflow-hidden">
              <Image
                src={perfume.image || '/placeholder-perfume.svg'}
                alt={perfume.name}
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-text-primary dark:text-text-primary truncate">
                {perfume.name}
              </h2>
              <p className="text-sm text-text-muted dark:text-text-muted">{perfume.brand}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-primary/5 dark:hover:bg-surface-elevated transition flex-shrink-0"
              aria-label={t('close')}
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>
      )}

      {/* Gold1: Loading / Error / No stores / Store cards */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground dark:text-text-muted">{t('loading')}</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <span className="text-5xl">⚠️</span>
            <p className="text-lg font-semibold text-center text-text-primary dark:text-text-primary">{t('tempError')}</p>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setIsLoading(true)
                fetchPrices(perfume.id)
                  .then((res) => {
                    if (res.success && res.data) {
                      setPriceData(res)
                      setError(null)
                    } else setError(t('tempError'))
                  })
                  .catch(() => setError(t('tempError')))
                  .finally(() => setIsLoading(false))
              }}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 dark:bg-amber-500 dark:hover:bg-amber-600 transition"
            >
              {t('retryButton')}
            </button>
          </div>
        )}

        {!isLoading && !error && !hasStores && (
          <div className="space-y-3">
            <p className="text-text-primary dark:text-text-primary">{t('noStores')}</p>
          </div>
        )}

        {!isLoading && !error && hasStores && (
          <div className="space-y-3">
            {stores.slice(0, 2).map((store) => (
              <StoreCard key={store.id} store={store} t={t} />
            ))}
            {stores.length > 2 && (
              <PremiumGate hiddenStoresCount={stores.length - 2} />
            )}
          </div>
        )}
      </div>

      {/* Footer: Close */}
      <div className="px-6 py-4 border-t border-primary/10 dark:border-border-subtle flex-shrink-0">
        <Button variant="outline" className="w-full" onClick={onClose}>
          {t('close')}
        </Button>
      </div>
    </div>
  )
}

function ProductCompareContent({
  perfumes,
  locale
}: {
  perfumes: ScoredPerfume[]
  locale: string
}) {
  void locale // passed by parent for RTL/layout if needed
  const t = useTranslations('results.compare')

  if (!perfumes?.length) return null

  return (
    <div className="space-y-6">
      {/* Thumbnails row */}
      <div className="flex flex-wrap gap-3 justify-center">
        {perfumes.map((p) => (
          <div
            key={p.id}
            className="flex flex-col items-center gap-2 w-20 shrink-0"
          >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-bg dark:bg-background border border-primary/10 dark:border-border-subtle">
              <Image
                src={p.image || '/placeholder-perfume.svg'}
                alt={p.name}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </div>
            <p className="text-xs font-medium text-text-primary dark:text-text-primary text-center line-clamp-2 leading-tight">
              {p.name}
            </p>
          </div>
        ))}
      </div>

      {/* Row 1: Match Score */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted">
          {t('matchLabel')}
        </p>
        <div className="flex flex-wrap gap-2">
          {perfumes.map((p) => (
            <span
              key={p.id}
              className={cn(
                'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold',
                p.finalScore >= 85
                  ? 'bg-safe-green/20 dark:bg-green-500/20 text-safe-green dark:text-green-400'
                  : p.finalScore >= 65
                    ? 'bg-warning-amber/20 dark:bg-amber-500/20 text-warning-amber dark:text-amber-400'
                    : 'bg-danger-red/20 dark:bg-red-500/20 text-danger-red dark:text-red-400'
              )}
            >
              {p.name}: {Math.round(p.finalScore)}%
            </span>
          ))}
        </div>
      </div>

      {/* Row 2: Safe / Warning */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted">
          {t('safeLabel')} / {t('warningLabel')}
        </p>
        <div className="flex flex-wrap gap-2">
          {perfumes.map((p) => (
            <span
              key={p.id}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
                p.isSafe
                  ? 'bg-safe-green/20 dark:bg-green-500/20 text-safe-green dark:text-green-400'
                  : 'bg-warning-amber/20 dark:bg-amber-500/20 text-warning-amber dark:text-amber-400'
              )}
            >
              {p.isSafe ? (
                <ShieldCheck className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {p.name}: {p.isSafe ? t('safeLabel') : t('warningLabel')}
            </span>
          ))}
        </div>
      </div>

      {/* Row 3: Fragrance Families */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted">
          {t('familiesLabel')}
        </p>
        <div className="space-y-2">
          {perfumes.map((p) => (
            <div key={p.id} className="flex flex-wrap gap-1.5">
              <span className="text-sm font-medium text-text-primary dark:text-text-primary shrink-0">
                {p.name}:
              </span>
              <span className="text-sm text-text-secondary dark:text-text-muted">
                {p.families?.length
                  ? p.families.join(', ')
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Key Ingredients */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted">
          {t('ingredientsLabel')}
        </p>
        <div className="space-y-2">
          {perfumes.map((p) => (
            <div key={p.id} className="flex flex-wrap gap-1.5">
              <span className="text-sm font-medium text-text-primary dark:text-text-primary shrink-0">
                {p.name}:
              </span>
              <span className="text-sm text-text-secondary dark:text-text-muted line-clamp-2">
                {p.ingredients?.length
                  ? p.ingredients.slice(0, 5).join(', ') +
                    (p.ingredients.length > 5 ? '…' : '')
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CompareBottomSheet({
  isOpen,
  onClose,
  mode,
  perfumes,
  perfume,
  tier,
  locale
}: CompareBottomSheetProps) {
  const t = useTranslations('results.compare')
  const isRtl = locale === 'ar'

  const showCompareContent = mode === 'compare' && perfumes && perfumes.length >= 2
  const showPriceHubContent = mode === 'price-hub' && perfume
  const showPlaceholder = mode === 'price-hub' && !perfume

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          {/* Sheet panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full sm:max-w-2xl max-h-[85vh] overflow-hidden bg-white dark:bg-surface-elevated rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Mode A: generic header + content + footer */}
            {!showPriceHubContent && (
              <>
                <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mt-3 mb-4 sm:hidden flex-shrink-0" />
                <div className="px-6 pb-4 flex-shrink-0">
                  <h3 className="text-lg font-bold text-text-primary dark:text-text-primary">
                    {t('sheetTitle')}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                  {showCompareContent && (
                    <ProductCompareContent perfumes={perfumes!} locale={locale} />
                  )}
                  {showPlaceholder && (
                    <p className="text-text-secondary dark:text-text-muted text-sm">
                      {t('comingSoon')}
                    </p>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-primary/10 dark:border-border-subtle flex-shrink-0">
                  <Button variant="outline" className="w-full" onClick={onClose}>
                    {t('close')}
                  </Button>
                </div>
              </>
            )}
            {/* Mode B: Gold1 header + Safety Check + PriceHubContent */}
            {showPriceHubContent && perfume && (() => {
              const safetyCheck = canShowPurchaseLinks(perfume)
              return (
                <>
                  <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mt-3 mb-4 sm:hidden flex-shrink-0" />
                  <div className="px-6 pb-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-text-primary dark:text-text-primary">
                      {t('sheetTitle')}
                    </h3>
                  </div>
                  <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                    {!safetyCheck.canPurchase ? (
                      <SafetyBlocker perfume={perfume} safetyCheck={safetyCheck} />
                    ) : (
                      <div className="mt-6 overflow-y-auto flex-1 min-h-0 flex flex-col">
                        <PriceHubContent
                          perfume={perfume}
                          tier={tier}
                          onClose={onClose}
                          t={t}
                          locale={locale}
                        />
                      </div>
                    )}
                  </div>
                </>
              )
            })()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
