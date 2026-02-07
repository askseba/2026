"use client"
import { useState, useEffect, useTransition } from 'react'
import { useRouter } from '@/i18n/routing'
import { X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useVoiceSearch } from '@/hooks/useVoiceSearch'
import { VoiceMicButton } from '@/components/ui/VoiceMicButton'
import { voiceSearchEnabled } from '@/lib/feature-flags'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useQuiz } from '@/contexts/QuizContext'
import logger from '@/lib/logger'

type LocalPerfume = { id: string; name: string; brand: string; image: string }

const MIN_SELECTIONS = 3
const MAX_SELECTIONS = 12

export default function Step1FavoritesPage() {
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  const router = useRouter()
  const t = useTranslations('quiz')
  const { setStep } = useQuiz()
  const [isPending, startTransition] = useTransition()
  const [selectedPerfumes, setSelectedPerfumes] = useState<LocalPerfume[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showMaxWarning, setShowMaxWarning] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<LocalPerfume[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Voice search integration
  const { state: voiceState, startListening, stopListening, reset, isSupported } = useVoiceSearch({
    lang: locale === 'ar' ? 'ar-SA' : 'en-US',
    onTranscript: (text) => setSearchTerm(text)
  })

  useEffect(() => {
    const saved = sessionStorage.getItem('quiz-step1')
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as unknown
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedPerfumes(parsed as LocalPerfume[])
        }
      } catch (e) {
        logger.error('Failed to load session:', e)
      }
    }
  }, [])

  useEffect(() => {
    if (selectedPerfumes.length > 0) {
      sessionStorage.setItem('quiz-step1', JSON.stringify(selectedPerfumes))
      setStep('step1_liked', selectedPerfumes.map(p => p.id))
    } else {
      sessionStorage.removeItem('quiz-step1')
      setStep('step1_liked', [])
    }
  }, [selectedPerfumes, setStep])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    if (!debouncedSearchTerm.trim() || debouncedSearchTerm.length < 2) {
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
      return
    }

    const controller = new AbortController()
    setIsSearching(true)
    setSearchError(null)

    fetch(`/api/perfumes/search?q=${encodeURIComponent(debouncedSearchTerm)}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!data.success || !data.data) throw new Error('Invalid response')
        const converted = data.data.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          brand: p.brand,
          image: p.image || p.imageUrl
        }))
        setSearchResults(converted)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setSearchError(t('step1.searchError'))
          setSearchResults([])
        }
      })
      .finally(() => setIsSearching(false))

    return () => controller.abort()
  }, [debouncedSearchTerm, t])

  const handleAddPerfume = (perfume: LocalPerfume) => {
    if (selectedPerfumes.length >= MAX_SELECTIONS) {
      setShowMaxWarning(true)
      setTimeout(() => setShowMaxWarning(false), 3000)
      toast.error(t('step1.maxError'))
      return
    }
    if (selectedPerfumes.find(p => p.id === perfume.id)) {
      toast.info(t('step1.alreadyAdded'))
      return
    }
    setSelectedPerfumes([...selectedPerfumes, perfume])
    setSearchTerm('')
    setSearchResults([])
  }

  const handleRemovePerfume = (id: string) => {
    setSelectedPerfumes(selectedPerfumes.filter(p => p.id !== id))
  }

  const handleNext = () => {
    if (selectedPerfumes.length >= MIN_SELECTIONS) {
      startTransition(() => {
        router.push('/quiz/step2-disliked', { scroll: false })
      })
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-cream-bg dark:!bg-surface p-6" dir={direction}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-primary dark:bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-text-primary/20 dark:bg-surface-muted" />
            <div className="w-3 h-3 rounded-full bg-text-primary/20 dark:bg-surface-muted" />
          </div>

          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary mb-2 text-center">
            {t('step1.title')}
          </h1>
          <p className="text-text-secondary dark:text-text-muted mb-8 text-center">
            {t('step1.description')}
          </p>

          <div className="mb-8 relative">
            <div className="relative">
              <Input
                type="text"
                placeholder={t('step1.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-4 pe-14 py-6 text-lg"
              />
              {isSearching ? (
                <Loader2 className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2 animate-spin text-primary w-5 h-5" />
              ) : (
                voiceSearchEnabled && isSupported && (
                  <VoiceMicButton
                    className="absolute inset-inline-end-4 top-1/2 -translate-y-1/2"
                    state={voiceState}
                    startListening={startListening}
                    stopListening={stopListening}
                    reset={reset}
                  />
                )
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full start-0 end-0 mt-2 bg-white dark:bg-surface-elevated rounded-xl shadow-elevation-2 z-50 max-h-64 overflow-y-auto border border-primary/10 dark:border-border-subtle">
                {searchResults.map((perfume) => (
                  <button
                    key={perfume.id}
                    onClick={() => handleAddPerfume(perfume)}
                    className="min-h-[44px] min-w-[44px] w-full text-right p-4 hover:bg-cream-bg dark:hover:bg-surface-muted transition-colors border-b dark:border-border-subtle last:border-b-0 flex flex-col touch-manipulation"
                  >
                    <span className="font-bold text-text-primary dark:text-text-primary dark:text-slate-100">{perfume.name}</span>
                    <span className="text-sm text-text-secondary dark:text-text-muted">{perfume.brand}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-bold mb-4 text-text-primary dark:text-text-primary">
              {t('step1.selectedTitle')} ({selectedPerfumes.length}/{MAX_SELECTIONS})
            </h2>

            {selectedPerfumes.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-surface/50 rounded-2xl border-2 border-dashed border-primary/20 dark:border-border-subtle text-text-secondary dark:text-text-muted">
                <p>{t('step1.emptyStateTitle')}</p>
                <p className="text-sm mt-1">{t('step1.emptyStateDescription')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {selectedPerfumes.map((perfume) => (
                  <SelectedPerfumeCard
                    key={perfume.id}
                    perfume={perfume}
                    onRemove={handleRemovePerfume}
                    removeAriaLabel={t('step1.removeAriaLabel', { name: perfume.name })}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 mx-auto max-w-md">
            <Button
              onClick={handleNext}
              disabled={selectedPerfumes.length < MIN_SELECTIONS || isPending}
              isLoading={isPending}
              className="w-full py-6 text-xl bg-gradient-to-r from-primary to-primary-dark text-primary-dark dark:text-white shadow-lg opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {t('step1.nextButtonWithCount', { count: selectedPerfumes.length, max: MAX_SELECTIONS })}
            </Button>
            {selectedPerfumes.length < MIN_SELECTIONS && (
              <p className="text-sm text-center mt-3 text-text-secondary dark:text-text-muted">
                {t('step1.minError')}
              </p>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

function SelectedPerfumeCard({ perfume, onRemove, removeAriaLabel }: { perfume: LocalPerfume; onRemove: (id: string) => void; removeAriaLabel: string }) {
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex items-center gap-4 p-3 bg-white dark:bg-surface rounded-xl shadow-elevation-1 border border-primary/5 dark:border-border-subtle hover:shadow-elevation-2 transition-all">
      <div className="relative w-20 h-20 flex-shrink-0 bg-cream-bg dark:bg-surface-muted rounded-lg overflow-hidden">
        <Image
          src={imageError || !perfume.image ? '/placeholder-perfume.svg' : perfume.image}
          alt={perfume.name}
          fill
          className="object-cover"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-text-primary dark:text-text-primary dark:text-slate-100 truncate">{perfume.name}</h3>
        <p className="text-sm text-text-secondary dark:text-text-muted truncate">{perfume.brand}</p>
      </div>
      <button
        onClick={() => onRemove(perfume.id)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-3 hover:bg-danger-red/10 dark:hover:bg-red-500/20 rounded-xl transition-colors touch-manipulation"
        aria-label={removeAriaLabel}
      >
        <X className="w-6 h-6 text-danger-red dark:text-red-400" />
      </button>
    </div>
  )
}
