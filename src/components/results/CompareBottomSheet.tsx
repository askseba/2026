'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { Link } from '@/i18n/routing'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, AlertCircle, X, Crown, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriceAlertButton } from '@/components/ui/PriceAlertButton'
import { cn } from '@/lib/classnames'
import type { ScoredPerfume } from '@/lib/matching'

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

// --- Mode B: Price Hub ---
interface StorePrice {
  id: string
  name: string
  logo: string
  price: number | null
  available: boolean
  url: string
  searchUrl: string
  lastUpdated: string | null
  priceSource: 'db' | 'none'
}

const FREE_VISIBLE_STORES = 2

function StoreLogo ({ name, logo }: { name: string; logo: string }) {
  const [imgError, setImgError] = useState(false)
  if (imgError || !logo) {
    return (
      <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <span className="text-lg font-bold text-primary dark:text-amber-500">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }
  return (
    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-surface-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
      <Image
        src={logo}
        alt={name}
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function StoreRow ({
  store,
  bestPrice,
  t
}: {
  store: StorePrice
  bestPrice: number | null
  t: (key: string, values?: Record<string, string>) => string
}) {
  const href = store.price !== null ? store.url : store.searchUrl
  const showBestBadge =
    bestPrice != null && store.price !== null && store.price === bestPrice

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-2xl border transition',
        showBestBadge
          ? 'border-primary/30 dark:border-amber-500/30 bg-primary/5 dark:bg-amber-500/5'
          : 'border-gray-100 dark:border-border-subtle bg-white dark:bg-surface',
        !store.available && 'opacity-60'
      )}
    >
      <StoreLogo name={store.name} logo={store.logo} />
      <div className="flex-1 min-w-0 text-start">
        <p className="text-sm font-bold text-text-primary dark:text-text-primary">{store.name}</p>
        <p className={cn('text-xs', store.available ? 'text-safe-green' : 'text-red-400')}>
          {store.available ? t('available') : t('outOfStock')}
        </p>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {store.price !== null ? (
          <>
            <div className="flex items-center gap-2">
              {showBestBadge && (
                <span className="text-[10px] font-bold text-safe-green bg-safe-green/10 dark:bg-green-500/20 px-1.5 py-0.5 rounded-full">
                  {t('bestPrice')}
                </span>
              )}
              <span className="text-lg font-black text-text-primary dark:text-text-primary whitespace-nowrap">
                {t('currency')} {store.price}
              </span>
            </div>
            {store.lastUpdated && (
              <span className="text-[10px] text-text-muted dark:text-text-muted">
                {t('lastUpdated', { date: new Date(store.lastUpdated).toLocaleDateString() })}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm font-bold text-primary dark:text-amber-500 whitespace-nowrap">
            {t('searchNow')}
          </span>
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition bg-text-primary dark:bg-white hover:opacity-80 cursor-pointer text-white dark:text-surface"
        aria-label={t('searchInStore', { store: store.name })}
      >
        <ChevronLeft className="w-4 h-4 text-white dark:text-surface" />
      </a>
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
  void locale // passed by parent for future use
  const [storesData, setStoresData] = useState<StorePrice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!perfume?.id) return
    setFetchError(null)
    let cancelled = false
    const run = async () => {
      await Promise.resolve()
      if (cancelled) return
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          perfumeId: perfume.id,
          name: perfume.name ?? '',
          brand: perfume.brand ?? '',
        })
        const res = await fetch(`/api/prices/compare?${params.toString()}`)
        if (!res.ok) throw new Error('Fetch failed')
        const data = await res.json()
        if (!cancelled) setStoresData(data.stores ?? [])
      } catch {
        if (!cancelled) setFetchError(t('fetchError'))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [perfume?.id, perfume?.name, perfume?.brand, t])

  const pricesWithValue = storesData.filter((s) => s.price !== null && s.price > 0).map((s) => s.price as number)
  const bestPrice = pricesWithValue.length > 0 ? Math.min(...pricesWithValue) : null
  const hasAnyRealPrice = storesData.some((s) => s.price !== null && s.price > 0)
  const hasAnyRealPriceForTitle = storesData.some((s) => s.price !== null)
  const pricedCount = storesData.filter((s) => s.price !== null).length
  const isPremium = tier === 'PREMIUM'
  const visibleStores = storesData.slice(0, isPremium ? storesData.length : FREE_VISIBLE_STORES)
  const remaining = Math.max(0, storesData.length - FREE_VISIBLE_STORES)

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

      {/* Title section */}
      <div className="px-6 py-3 bg-primary/5 dark:bg-amber-500/5 flex-shrink-0">
        <h3 className="text-sm font-bold text-text-primary dark:text-text-primary">
          {hasAnyRealPriceForTitle ? t('priceHubTitle') : t('priceHubSearchTitle')}
        </h3>
      </div>

      {/* Price counter */}
      {!isLoading && pricedCount > 0 && (
        <div className="px-6 py-1">
          <p className="text-[10px] text-text-muted dark:text-text-muted text-center">
            {t('priceCount', { count: String(pricedCount), total: String(storesData.length) })}
          </p>
        </div>
      )}

      {/* Store rows */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {isLoading && (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-border-subtle"
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-surface-muted animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-100 dark:bg-surface-muted rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-50 dark:bg-surface-muted rounded mt-2 animate-pulse" />
                </div>
                <div className="h-5 w-20 bg-gray-100 dark:bg-surface-muted rounded animate-pulse" />
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-surface-muted animate-pulse" />
              </div>
            ))}
          </>
        )}

        {!isLoading && fetchError && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-text-muted dark:text-text-muted mb-4">{fetchError}</p>
            <button
              type="button"
              onClick={() => {
                setFetchError(null)
                setIsLoading(true)
                const params = new URLSearchParams({
                  perfumeId: perfume.id,
                  name: perfume.name ?? '',
                  brand: perfume.brand ?? '',
                })
                fetch(`/api/prices/compare?${params.toString()}`)
                  .then((res) => { if (!res.ok) throw new Error(); return res.json() })
                  .then((data) => setStoresData(data.stores ?? []))
                  .catch(() => setFetchError(t('fetchError')))
                  .finally(() => setIsLoading(false))
              }}
              className="text-sm font-bold text-primary dark:text-amber-500 hover:underline"
            >
              {t('retry')}
            </button>
          </div>
        )}

        {!isLoading && !fetchError && storesData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <h4 className="text-sm font-bold text-text-primary dark:text-text-primary mb-2">
              {t('noStoresTitle')}
            </h4>
            <p className="text-xs text-text-muted dark:text-text-muted">
              {t('noStoresDesc')}
            </p>
          </div>
        )}

        {!isLoading && !fetchError && storesData.length > 0 && (
          <>
            <p className="text-xs text-text-muted dark:text-text-muted mb-2">
              {hasAnyRealPrice ? t('pricesMixed') : t('pricesSearch')}
            </p>
            {visibleStores.map((store) => (
              <StoreRow key={store.id} store={store} bestPrice={bestPrice} t={t} />
            ))}

            {/* FREE: Blurred stores + GatingOverlay */}
            {!isPremium && remaining > 0 && (
              <div className="relative group">
                <div className="filter blur-[8px] opacity-50 pointer-events-none select-none space-y-3">
                  {Array.from({ length: remaining }).map((_, i) => (
                    <div
                      key={`blur-${i}`}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-border-subtle"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-surface-muted" />
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-gray-100 rounded" />
                        <div className="h-3 w-16 bg-gray-50 rounded mt-1" />
                      </div>
                      <div className="h-5 w-20 bg-gray-100 rounded" />
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/90 to-black/10 dark:from-black/60 dark:to-black/80 backdrop-blur-md">
                  <div className="bg-white dark:bg-surface rounded-2xl shadow-elevation-2 dark:shadow-black/30 p-6 text-center max-w-xs border border-primary/10 dark:border-border-subtle">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 dark:bg-amber-500/10 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-primary dark:text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-text-primary dark:text-text-primary mb-1">
                      {t('moreStoresLocked', { remaining: String(remaining) })}
                    </p>
                    <p className="text-xs text-text-muted dark:text-text-muted mb-4">
                      {t('alertHint')}
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-amber-500 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                    >
                      <Crown className="w-4 h-4" />
                      {t('subscribeToPrices')}
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer: PriceAlertButton (PREMIUM only) or Close */}
      <div className="px-6 py-4 border-t border-primary/10 dark:border-border-subtle flex-shrink-0 space-y-3">
        {isPremium && bestPrice != null && bestPrice > 0 && tier && (
          <PriceAlertButton
            perfumeId={perfume.id}
            perfumeName={perfume.name}
            currentPrice={bestPrice}
            tier={tier}
          />
        )}
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
            {/* Mode B: PriceHubContent (own sticky header + body + footer) */}
            {showPriceHubContent && perfume && (
              <>
                <div className="w-10 h-1 bg-border-subtle rounded-full mx-auto mt-3 sm:hidden flex-shrink-0" />
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <PriceHubContent
                    perfume={perfume}
                    tier={tier}
                    onClose={onClose}
                    t={t}
                    locale={locale}
                  />
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
